import os
import psutil
import json
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-Bridge")

app = FastAPI(title="H.O.M.E Local AI Bridge")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
HOST_MOUNT_DIR = os.getenv("HOST_MOUNT_DIR", ".")

# Basic in-memory context (in a real app, this should be per-user/session in a DB)
chat_history = []

SYSTEM_PROMPT = f"""You are H.O.M.E Local AI, a highly capable private operating assistant running on the user's local machine.
You have access to the user's file system via the mount point '{HOST_MOUNT_DIR}'.
To execute an action, you must return ONLY a JSON object with the following structure:
{{
  "action": "list_files", 
  "path": "/mnt/host/Documents"
}}
OR
{{
  "action": "read_file",
  "path": "/mnt/host/Documents/file.txt"
}}
OR
{{
  "action": "get_system_stats"
}}

If you do not need to execute an action and simply want to reply to the user, return your response as plain text (do NOT use JSON).
Always assist the user securely and professionally. Do not execute actions outside of '{HOST_MOUNT_DIR}'.
"""

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

def execute_tool(action: str, kwargs: dict) -> str:
    try:
        if action == "list_files":
            path = kwargs.get("path", HOST_MOUNT_DIR)
            if not path.startswith(HOST_MOUNT_DIR):
                return "Error: Path outside of allowed host mount."
            if not os.path.exists(path):
                return "Error: Directory not found."
            items = os.listdir(path)
            return f"Files in {path}: {', '.join(items[:50])}"
            
        elif action == "read_file":
            path = kwargs.get("path", "")
            if not path.startswith(HOST_MOUNT_DIR):
                return "Error: Path outside of allowed host mount."
            if not os.path.exists(path):
                return "Error: File not found."
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read(2000) # Read up to 2000 chars to prevent context overflow
            return f"File snippet: {content}"
            
        elif action == "get_system_stats":
            cpu = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory()
            return f"CPU Usage: {cpu}%, Memory Usage: {mem.percent}% ({mem.available / (1024**3):.2f} GB free)"
            
        else:
            return f"Error: Unknown action '{action}'"
    except Exception as e:
        return f"Error executing {action}: {str(e)}"

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    global chat_history
    
    if not chat_history:
        chat_history.append({"role": "system", "content": SYSTEM_PROMPT})
        
    chat_history.append({"role": "user", "content": request.message})
    
    # Loop for a maximum of 3 tool calls
    for _ in range(3):
        payload = {
            "model": "llama3",
            "messages": chat_history,
            "stream": False
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(OLLAMA_URL, json=payload)
                response.raise_for_status()
                result = response.json()
                
                ai_message = result.get("message", {}).get("content", "")
                chat_history.append({"role": "assistant", "content": ai_message})
                
                # Check if it's a JSON tool call
                try:
                    tool_call = json.loads(ai_message)
                    if "action" in tool_call:
                        logger.info(f"AI requested action: {tool_call['action']}")
                        tool_result = execute_tool(tool_call["action"], tool_call)
                        chat_history.append({"role": "system", "content": f"Action Result: {tool_result}"})
                        continue # Send the result back to Ollama
                except json.JSONDecodeError:
                    pass # Not JSON, just a normal text response
                
                # If we get here, it was a normal text response
                return {"response": ai_message}
                
        except Exception as e:
            logger.error(f"Error calling Ollama: {e}")
            raise HTTPException(status_code=500, detail=str(e))
            
    return {"response": "Task executed but AI reached reasoning limit."}

@app.post("/reset")
async def reset():
    global chat_history
    chat_history = []
    return {"status": "ok"}

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>H.O.M.E Local AI Assistant</title>
        <style>
            body { font-family: -apple-system, system-ui, sans-serif; background: #0f172a; color: white; margin: 0; padding: 20px; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }
            #chat-container { flex: 1; overflow-y: auto; background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155; }
            .message { margin-bottom: 15px; line-height: 1.5; padding: 12px; border-radius: 8px; max-width: 80%; }
            .user-msg { background: #3b82f6; align-self: flex-end; margin-left: auto; }
            .ai-msg { background: #334155; margin-right: auto; }
            .system-msg { background: #052e16; color: #a7f3d0; font-family: monospace; font-size: 0.9em; margin: 5px auto; max-width: 90%; }
            #input-container { display: flex; gap: 10px; }
            input { flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: white; font-size: 16px; outline: none; }
            button { padding: 15px 30px; border-radius: 8px; border: none; background: #3b82f6; color: white; font-weight: bold; cursor: pointer; transition: 0.2s; }
            button:hover { background: #2563eb; }
        </style>
    </head>
    <body>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">H.O.M.E Local Private AI</h2>
            <button onclick="resetChat()" style="background: #ef4444; padding: 8px 16px;">Reset Context</button>
        </div>
        <div id="chat-container"></div>
        <div id="input-container">
            <input type="text" id="user-input" placeholder="Ask your private AI to analyze files or system stats..." onkeypress="if(event.key === 'Enter') sendMessage()">
            <button onclick="sendMessage()">Send</button>
        </div>

        <script>
            const chatContainer = document.getElementById('chat-container');
            const inputField = document.getElementById('user-input');

            function appendMessage(role, content) {
                const div = document.createElement('div');
                div.className = `message ${role}-msg`;
                // Basic markdown-like formatting for newlines
                div.innerHTML = content.replace(/\\n/g, '<br>');
                chatContainer.appendChild(div);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            async function sendMessage() {
                const text = inputField.value.trim();
                if (!text) return;
                
                appendMessage('user', text);
                inputField.value = '';
                
                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text })
                    });
                    const data = await response.json();
                    appendMessage('ai', data.response || "No response");
                } catch (err) {
                    appendMessage('system', 'Error connecting to Local AI: ' + err.message);
                }
            }

            async function resetChat() {
                await fetch('/reset', { method: 'POST' });
                chatContainer.innerHTML = '';
                appendMessage('system', 'Context cleared. Memory reset.');
            }
            
            appendMessage('system', 'Welcome to your private H.O.M.E AI. Connected to Local Ollama engine.');
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    print("🚀 H.O.M.E Local AI Bridge starting on port 9000...")
    uvicorn.run(app, host="0.0.0.0", port=9000)

import os
import psutil
import json
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-Bridge")

app = FastAPI(title="H.O.M.E Local AI Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
async def health_check():
    return {"status": "ok", "agent": "HOME Local AI", "version": "1.0.0"}

@app.get("/models")
async def check_models():
    try:
        # Check if Ollama has llama3 or phi3
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(OLLAMA_URL.replace("/api/chat", "/api/tags"))
            if resp.status_code == 200:
                models = resp.json().get("models", [])
                return {"status": "ok", "models": [m["name"] for m in models]}
            return {"status": "error", "detail": "Ollama tags API failed"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>H.O.M.E Local Control Center</title>
        <style>
            :root {
                --bg: #030712;
                --surface: #111827;
                --surface-hover: #1f2937;
                --border: #374151;
                --primary: #4f46e5;
                --primary-hover: #4338ca;
                --text: #f9fafb;
                --text-muted: #9ca3af;
                --success: #10b981;
            }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                background: var(--bg); 
                color: var(--text); 
                margin: 0; 
                height: 100vh; 
                display: flex;
                overflow: hidden;
            }
            .sidebar {
                width: 280px;
                background: var(--surface);
                border-right: 1px solid var(--border);
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .main {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 20px 40px;
                max-width: 900px;
                margin: 0 auto;
                width: 100%;
            }
            h1, h2, h3 { margin: 0; font-weight: 600; }
            .brand {
                font-size: 20px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--border);
            }
            .status-card {
                background: rgba(255,255,255,0.03);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 16px;
            }
            .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 12px;
                font-size: 14px;
            }
            .badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                background: rgba(16, 185, 129, 0.2);
                color: var(--success);
            }
            #chat-container {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                margin-bottom: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .message {
                padding: 12px 16px;
                border-radius: 12px;
                max-width: 85%;
                line-height: 1.5;
                font-size: 15px;
            }
            .user-msg {
                background: var(--primary);
                align-self: flex-end;
                color: white;
            }
            .ai-msg {
                background: var(--surface-hover);
                align-self: flex-start;
                border: 1px solid var(--border);
            }
            .system-msg {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                color: #34d399;
                font-family: monospace;
                font-size: 13px;
                align-self: center;
                max-width: 95%;
            }
            #input-container {
                display: flex;
                gap: 12px;
            }
            input {
                flex: 1;
                padding: 16px 20px;
                border-radius: 12px;
                border: 1px solid var(--border);
                background: var(--surface);
                color: white;
                font-size: 16px;
                outline: none;
                transition: border-color 0.2s;
            }
            input:focus { border-color: var(--primary); }
            button {
                padding: 0 24px;
                border-radius: 12px;
                border: none;
                background: var(--primary);
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
                font-size: 16px;
            }
            button:hover { background: var(--primary-hover); }
            .btn-outline {
                background: transparent;
                border: 1px solid var(--border);
                padding: 8px 16px;
                font-size: 13px;
                border-radius: 8px;
            }
            .btn-outline:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; }
            .btn-danger { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
            .btn-danger:hover { background: rgba(239, 68, 68, 0.3); }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div class="brand">
                <div style="width:24px;height:24px;background:var(--primary);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;">H</div>
                H.O.M.E Local
            </div>
            
            <div class="status-card">
                <h3 style="font-size:14px;color:var(--text-muted);margin-bottom:8px;">System Status</h3>
                <div class="status-item"><span>Engine</span><span class="badge">Online</span></div>
                <div class="status-item"><span>Ollama</span><span class="badge" id="ollama-status">Checking...</span></div>
                <div class="status-item"><span>File Access</span><span class="badge">Granted</span></div>
                <div class="status-item"><span>Privacy</span><span class="badge" style="background:rgba(59,130,246,0.2);color:#60a5fa;">Isolated</span></div>
            </div>

            <div style="margin-top:auto;">
                <button class="btn-outline btn-danger" style="width:100%;" onclick="resetChat()">Wipe Memory Context</button>
            </div>
        </div>

        <div class="main">
            <div style="margin-bottom:20px;">
                <h2 style="font-size:24px;margin-bottom:8px;">Private AI Assistant</h2>
                <p style="color:var(--text-muted);font-size:15px;margin:0;">Executing inference locally. Ask me to read logs or check CPU usage.</p>
            </div>

            <div id="chat-container"></div>
            
            <div id="input-container">
                <input type="text" id="user-input" placeholder="Ask your local AI something..." onkeypress="if(event.key === 'Enter') sendMessage()">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>

        <script>
            const chatContainer = document.getElementById('chat-container');
            const inputField = document.getElementById('user-input');

            // Initialize formatting
            function formatMessage(content) {
                // Convert \n to <br>
                let html = content.replace(/\\n/g, '<br>');
                // Simple code block formatting
                html = html.replace(/```(.*?)```/gs, '<pre style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;overflow-x:auto;"><code>$1</code></pre>');
                return html;
            }

            function appendMessage(role, content) {
                const div = document.createElement('div');
                div.className = `message ${role}-msg`;
                div.innerHTML = formatMessage(content);
                chatContainer.appendChild(div);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            async function sendMessage() {
                const text = inputField.value.trim();
                if (!text) return;
                
                appendMessage('user', text);
                inputField.value = '';
                
                // Show thinking...
                const thinkingDiv = document.createElement('div');
                thinkingDiv.className = 'message ai-msg';
                thinkingDiv.id = 'thinking-indicator';
                thinkingDiv.innerHTML = '<span style="opacity:0.5;">Analyzing...</span>';
                chatContainer.appendChild(thinkingDiv);
                chatContainer.scrollTop = chatContainer.scrollHeight;

                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text })
                    });
                    
                    document.getElementById('thinking-indicator')?.remove();
                    
                    if (response.ok) {
                        const data = await response.json();
                        appendMessage('ai', data.response || "No response generated.");
                    } else {
                        throw new Error('API Error');
                    }
                } catch (err) {
                    document.getElementById('thinking-indicator')?.remove();
                    appendMessage('system', 'Connection failed. Ensure Ollama is running and model is pulled.');
                }
            }

            async function resetChat() {
                try {
                    await fetch('/reset', { method: 'POST' });
                    chatContainer.innerHTML = '';
                    appendMessage('system', 'Context successfully wiped.');
                } catch (e) {
                    alert('Error resetting chat');
                }
            }
            
            // Initial checks
            async function checkSystem() {
                try {
                    const res = await fetch('/models');
                    const data = await res.json();
                    if(data.status === 'ok' && data.models.length > 0) {
                        document.getElementById('ollama-status').innerText = 'Ready';
                    } else {
                        document.getElementById('ollama-status').innerText = 'No Models';
                        document.getElementById('ollama-status').style.color = '#f59e0b';
                        document.getElementById('ollama-status').style.background = 'rgba(245, 158, 11, 0.2)';
                    }
                } catch (e) {
                    document.getElementById('ollama-status').innerText = 'Disconnected';
                    document.getElementById('ollama-status').style.color = '#ef4444';
                    document.getElementById('ollama-status').style.background = 'rgba(239, 68, 68, 0.2)';
                }
            }
            
            checkSystem();
            appendMessage('system', 'Local inference engine initialized. Mount path: Active.');
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    print("🚀 H.O.M.E Local AI Bridge starting on port 9000...")
    uvicorn.run(app, host="0.0.0.0", port=9000)

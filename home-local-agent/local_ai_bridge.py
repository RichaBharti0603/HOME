from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-Bridge")

app = FastAPI(title="H.O.M.E Local AI Bridge")

class AnalyzeRequest(BaseModel):
    prompt: str

class AnalyzeResponse(BaseModel):
    response: str
    model: str

OLLAMA_URL = "http://localhost:11434/api/generate"

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    logger.info(f"Received analysis request: {request.prompt[:50]}...")
    
    payload = {
        "model": "llama3",
        "prompt": request.prompt,
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            result = response.json()
            
            logger.info("Successfully received response from Ollama")
            return {
                "response": result.get("response", "No response generated."),
                "model": result.get("model", "llama3")
            }
    except Exception as e:
        logger.error(f"Error calling Ollama: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Local AI Bridge is active"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 H.O.M.E Local AI Bridge starting on port 9000...")
    uvicorn.run(app, host="0.0.0.0", port=9000)

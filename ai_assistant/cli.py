from fastapi import FastAPI, HTTPException
from typing import List
import os

from assistant import HomeAI

# Initialize FastAPI app
app = FastAPI(title="H.O.M.E Local AI Assistant")

# Example API Key from ENV
olama_api_key = os.getenv("OLAMA_API_KEY", "local_key_here")
ai = HomeAI(olama_api_key=olama_api_key)

# Example POST request to send monitor data and get suggestions
@app.post("/suggestions")
def get_suggestions(monitors: List[dict]):
    """
    monitors: list of dicts like {"project_name": "...", "url": "...", "status": "..."}
    """
    if not monitors:
        raise HTTPException(status_code=400, detail="No monitor data provided")
    response = ai.process_monitors(monitors)
    return {"ai_suggestions": response}
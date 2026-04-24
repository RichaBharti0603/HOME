from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from backend.models import Monitor, get_db  # adjust import paths as needed
from ai_assistant.assistant import HomeAI

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

# Initialize the AI assistant with your Olama API key
olama_api_key = os.getenv("OLAMA_API_KEY", "your_key_here")
ai_assistant = HomeAI(olama_api_key=olama_api_key)

@router.get("/suggestions")
def get_ai_suggestions(db: Session = Depends(get_db)):
    """
    Fetch all monitors from DB, summarize, and get AI suggestions.
    """
    monitors = db.query(Monitor).all()
    
    if not monitors:
        raise HTTPException(status_code=404, detail="No monitors found")

    # Convert SQLAlchemy objects to dicts
    monitor_list = [
        {"project_name": m.project_name, "url": m.url, "status": m.status}
        for m in monitors
    ]

    # Get AI suggestions
    suggestions = ai_assistant.process_monitors(monitor_list)
    return {"summary": monitor_list, "ai_suggestions": suggestions}
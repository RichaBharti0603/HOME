from fastapi import APIRouter, HTTPException
from services.ollama_service import generate_response

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat")
def chat(prompt: str):
    try:
        reply = generate_response(prompt)
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

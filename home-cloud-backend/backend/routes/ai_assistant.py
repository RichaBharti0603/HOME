from fastapi import APIRouter
from services.azure_openai import ask_private_ai
from backend.models.schemas import PromptRequest

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/ask")
def ask_ai(request: PromptRequest):
    answer = ask_private_ai(request.prompt)
    return {"response": answer}

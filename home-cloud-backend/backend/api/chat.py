from fastapi import APIRouter
from schemas.chat import ChatRequest, ChatResponse
from core.llm.llm_router import process_prompt
from core.memory.conversation_store import save_message

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    save_message("user", request.message)

    result = process_prompt(request.message)

    save_message("assistant", result["reply"])

    return result

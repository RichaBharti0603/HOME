# backend/api/server.py

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

from backend.memory.session_store import get_session_context, append_to_session
from backend.models.local_llm import generate_response  # ensure this is your updated LLM

app = FastAPI()


class AskRequest(BaseModel):
    question: str
    session_id: str


@app.post("/ask_stream")
async def ask_stream(request: AskRequest):
    session_id = request.session_id
    question = request.question

    # Get past conversation
    context = get_session_context(session_id)

    # Append user message to session
    append_to_session(session_id, "user", question)

    def response_stream():
        # generate_response should accept: question and context (list of messages)
        answer = generate_response(question, context)

        # Append assistant message
        append_to_session(session_id, "assistant", answer)

        yield answer

    return StreamingResponse(response_stream(), media_type="text/plain")

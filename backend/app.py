from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import time

# ------------------------------
# APP INIT (MUST BE FIRST)
# ------------------------------
app = FastAPI(title="HOME AI Assistant API")

# ------------------------------
# MIDDLEWARE
# ------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# MODELS
# ------------------------------
class Query(BaseModel):
    question: str
    user_id: str | None = None
    stream: bool = False

# ------------------------------
# STREAM GENERATOR (DEMO)
# ------------------------------
def demo_streaming_answer(text: str):
    for char in text:
        yield char
        time.sleep(0.02)

# ------------------------------
# ROUTES
# ------------------------------
@app.get("/")
def root():
    return {"status": "HOME backend running"}

@app.post("/ask")
def ask(payload: Query):
    return {
        "answer": f"HOME AI received your query: {payload.question}"
    }

@app.post("/ask_stream")
def ask_stream(payload: Query):
    return StreamingResponse(
        demo_streaming_answer(
            "HOME AI is live. This is a secure, private AI response for demo purposes."
        ),
        media_type="text/plain"
    )

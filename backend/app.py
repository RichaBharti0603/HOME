from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
from azure.ai.openai import OpenAIClient
from azure.core.credentials import AzureKeyCredential
import asyncio

# Initialize Azure OpenAI
client = OpenAIClient(
    endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    credential=AzureKeyCredential(os.environ["AZURE_OPENAI_KEY"])
)

app = FastAPI(title="HOME AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str
    user_id: str = None
    stream: bool = False

# ------------------------------
# Helper: Stream Azure AI response
# ------------------------------
async def generate_streaming_answer(prompt: str):
    # Use async generator for streaming
    chat = client.chat_completions.begin_create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        streaming=True
    )
    async for chunk in chat:
        # chunk is partial content
        if chunk.delta and "content" in chunk.delta:
            yield chunk.delta["content"]
            await asyncio.sleep(0.01)  # smooth streaming

# ------------------------------
# AI endpoint: Streaming
# ------------------------------
@app.post("/ask_stream")
async def ask_stream(payload: Query):
    prompt = payload.question
    return StreamingResponse(generate_streaming_answer(prompt), media_type="text/plain")

# ------------------------------
# AI endpoint: Synchronous
# ------------------------------
@app.post("/ask")
async def ask(payload: Query):
    prompt = payload.question
    response = client.chat_completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    answer = response.choices[0].message.content
    return {"answer": answer}

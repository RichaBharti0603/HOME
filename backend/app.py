from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# AI
from backend.ai.prompt_router import route_prompt

# Monitoring router
from backend.routes.website_routes import router as website_router

# 1️⃣ Create app
app = FastAPI(title="HOME AI Assistant Backend")

# 2️⃣ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3️⃣ Models
class ChatRequest(BaseModel):
    message: str
    provider: str = "local"

# 4️⃣ AI Chat API
@app.post("/api/ai/chat")
def chat(req: ChatRequest):
    response = route_prompt(req.message, req.provider)
    return {"response": response}
app.include_router(website_router)

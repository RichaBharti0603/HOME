import os
import threading
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Database & models
from core.database import Base, engine, get_db
from models.website import Website

# Routes
from routes.website_routes import router as website_router
from routes.status_routes import router as status_router

# Services
from services.monitor import check_websites

# AI
from ai.prompt_router import route_prompt

# 1️⃣ Create app
app = FastAPI(title="HOME AI Assistant Backend")

# 2️⃣ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3️⃣ Models for AI chat
class ChatRequest(BaseModel):
    message: str
    provider: str = "local"

# 4️⃣ AI Chat API
@app.post("/api/ai/chat")
def chat(req: ChatRequest):
    response = route_prompt(req.message, req.provider)
    return {"response": response}

# Include website & status routers
app.include_router(website_router)
app.include_router(status_router)

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}

# Monitoring loop (threaded)
def monitor_loop():
    while True:
        try:
            check_websites()
        except Exception as e:
            print("Monitoring error:", e)
        finally:
            import time; time.sleep(60)

@app.on_event("startup")
def start_monitoring_thread():
    threading.Thread(target=monitor_loop, daemon=True).start()

# Create tables
Base.metadata.create_all(bind=engine)

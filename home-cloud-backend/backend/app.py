# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import threading
import os

# Database
from core.database import Base, engine, SessionLocal
from models.website import Website

# Monitoring
from services.monitor import check_websites

# AI
from ai.prompt_router import route_prompt

# Routers
from routes.website_routes import router as website_router
from routes.status_routes import router as status_router

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

# 3️⃣ AI Chat API
class ChatRequest(BaseModel):
    message: str
    provider: str = "local"

@app.post("/api/ai/chat")
def chat(req: ChatRequest):
    response = route_prompt(req.message, req.provider)
    return {"response": response}

# 4️⃣ Include Routers
app.include_router(website_router)
app.include_router(status_router)

# 5️⃣ Healthcheck
@app.get("/health")
def health():
    return {"status": "ok"}

# 6️⃣ Background monitoring loop
def threaded_monitor():
    while True:
        try:
            check_websites()
        except Exception as e:
            print("Monitoring error:", e)
        finally:
            import time
            time.sleep(60)  # 1 min interval

@app.on_event("startup")
def start_background_tasks():
    # Start monitoring in a daemon thread
    threading.Thread(target=threaded_monitor, daemon=True).start()

# 7️⃣ Create DB tables
Base.metadata.create_all(bind=engine)


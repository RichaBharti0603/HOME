from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import threading
import time

# Core
from core.database import Base, engine
from core.monitoring_worker import monitoring_loop

# Models
from models.website import Website

# Routes
from routes.website_routes import router as website_router
from routes.status_routes import router as status_router

# Services
from services.monitor import check_websites

# AI
from ai.prompt_router import route_prompt


# --------------------
# App Initialization
# --------------------
app = FastAPI(title="HOME AI Assistant Backend")

# --------------------
# CORS
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Models
# --------------------
class ChatRequest(BaseModel):
    message: str
    provider: str = "local"

# --------------------
# AI Chat API
# --------------------
@app.post("/api/ai/chat")
def chat(req: ChatRequest):
    response = route_prompt(req.message, req.provider)
    return {"response": response}

# --------------------
# Routers
# --------------------
app.include_router(website_router)
app.include_router(status_router)

# --------------------
# Background Monitoring
# --------------------
@app.on_event("startup")
async def startup_tasks():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Async monitoring loop
    asyncio.create_task(monitoring_loop())

    # Fallback threaded loop (optional safety)
    def threaded_monitor():
        while True:
            check_websites()
            time.sleep(60)

    threading.Thread(target=threaded_monitor, daemon=True).start()

# --------------------
# Health Check
# --------------------
@app.get("/health")
def health():
    return {"status": "ok"}

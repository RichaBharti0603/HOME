from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from backend.core.monitoring_worker import monitoring_loop
from backend.core.database import Base, engine
from backend.models.website import Website
from backend.core.scheduler import start_monitoring
from backend.routes.status_routes import router as status_router
import threading
import time
from backend.services.monitor import check_websites



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


@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(monitoring_loop())

Base.metadata.create_all(bind=engine)
start_monitoring()

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(status_router)

def monitor_loop():
    while True:
        check_websites()
        time.sleep(60)

@app.on_event("startup")
def start_monitor():
    threading.Thread(target=monitor_loop, daemon=True).start()




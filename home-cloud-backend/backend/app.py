from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import time

from core.database import Base, engine
from services.monitor import check_websites
from routes.website_routes import router as website_router
from routes.status_routes import router as status_router
from routes.auth_routes import router as auth_router


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HOME Cloud Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(website_router, prefix="/api/websites")
app.include_router(status_router, prefix="/api/status")

@app.get("/health")
def health():
    return {"status": "ok"}

def monitor_loop():
    while True:
        check_websites()
        time.sleep(60)

@app.on_event("startup")
def start_monitor():
    threading.Thread(target=monitor_loop, daemon=True).start()

app.include_router(auth_router)


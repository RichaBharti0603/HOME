from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import time
from backend.core.database import Base, engine
from backend.services.monitor import check_websites
from backend.routes.website_routes import router as website_router
from backend.routes.status_routes import router as status_router
from backend.routes.auth_routes import router as auth_router
from backend.models.user import User
from backend.models.website import Website
from backend.models.tenant import Tenant
from backend.models.monitoring_result import MonitoringResult
from backend.services.scheduler import scheduler_loop
from backend.services.worker_loop import worker_loop




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
@app.on_event("startup")
def start_background_services():
    threading.Thread(target=scheduler_loop, daemon=True).start()
    threading.Thread(target=worker_loop, daemon=True).start()




from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import start_scheduler
from app.config import get_settings
import logging
from app.database import engine, Base, get_db
import app.models.user
import app.models.monitor
import app.models.log
import app.models.alert
import app.models.tenant
import app.models.billing
from sqlalchemy import text
import redis
from app.core.system_guard import RedisHealthGuard

# Routers
from app.routes import auth, monitor as monitor_route, alert, ai, health, billing, engine as engine_route

# ============================================
# Logging
# ============================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logging.getLogger("apscheduler").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)
settings = get_settings()




# ============================================
# Lifespan
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.app_name}...")
    
    try:
        # Ensure database tables are created
        Base.metadata.create_all(bind=engine)
        logger.info("Database migration check completed successfully")
    except Exception as e:
        logger.error(f"Failed to database operations: {e}")

    try:
        # Check Redis Health
        RedisHealthGuard.ping_and_verify()
        
        # Phase 2: Conditional Scheduler
        import os
        if os.getenv("ENABLE_SCHEDULER") == "true":
            start_scheduler()
            logger.info("Scheduler started successfully")
        else:
            logger.warning("Scheduler DISABLED via ENABLE_SCHEDULER env var")
    except Exception as e:
        logger.error(f"Failed to start the scheduler: {e}")

    yield

    logger.info(f"Shutting down {settings.app_name}...")

# ============================================
# Create App
# ============================================
app = FastAPI(
    title=settings.app_name,
    description="Hyper-Optimized Monitoring Engine",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
)

# ============================================
# CORS Configuration
# ============================================
# Production Origin: https://home-frontend-fjvl.onrender.com
# Development Origins: localhost:3000, localhost:5173
origins = [
    "https://home-frontend-fjvl.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# If in development mode, we can be more permissive if needed
if settings.app_env != "production":
    logger.info("Development mode: Allowing extra origins for testing")
    # You could add more here if needed

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if settings.app_env == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 5: Logging Middleware (including Origin tracking)
import time
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    origin = request.headers.get("origin")
    logger.info(f"Incoming: {request.method} {request.url} | Origin: {origin}")
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    logger.info(f"Request {request.url} took {duration:.4f}s | Status: {response.status_code}")
    return response


# ============================================
# Routers
# ============================================
app.include_router(auth.router)
app.include_router(monitor_route.router)
app.include_router(alert.router)
app.include_router(health.router)
app.include_router(billing.router)
app.include_router(engine_route.router)
from fastapi import WebSocket, WebSocketDisconnect
from app.utils.websocket_manager import manager

app.include_router(ai.router)

# ============================================
# Endpoints
# ============================================
@app.get("/health", tags=["System"])
async def health_check():
    # Phase 1: Minimal Health Check to avoid cold-start delays
    return {"status": "ok", "app": settings.app_name}


@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
    }
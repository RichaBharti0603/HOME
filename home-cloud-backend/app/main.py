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
from app.routes import auth, monitor as monitor_route, alert, ai, health, billing

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
        # Ensure database tables are created (useful for SQLite fast prototyping)
        Base.metadata.create_all(bind=engine)
        logger.info("Database migration check completed successfully")
    except Exception as e:
        logger.error(f"Failed to connect to or migrate the database: {e}")
        logger.error("The application will continue starting, but database operations will fail.")

    try:
        # Check Redis Health
        RedisHealthGuard.ping_and_verify()
        
        # Start Scheduler
        start_scheduler()
        logger.info("Scheduler started successfully")
    except Exception as e:
        logger.error(f"Failed to start the scheduler: {e}")
        logger.error("The application will continue starting, but scheduled tasks will not run.")

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
    redoc_url="/redoc" if settings.debug else None,
)


# ============================================
# CORS
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Routers
# ============================================
app.include_router(auth.router)
app.include_router(monitor_route.router)
app.include_router(alert.router)
app.include_router(health.router)
app.include_router(billing.router)
from fastapi import WebSocket, WebSocketDisconnect
from app.utils.websocket_manager import manager

app.include_router(ai.router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, monitor_id: str = None):
    await manager.connect(websocket, monitor_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, monitor_id)


# ============================================
# Endpoints
# ============================================
@app.get("/health", tags=["System"])
async def health_check():
    health_status = {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.app_env,
        "database": "unknown",
        "redis": "unknown"
    }
    
    # Check Database
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = f"disconnected: {str(e)}"
        health_status["status"] = "degraded"
        
    # Check Redis
    health_status["redis"] = "connected" if RedisHealthGuard.is_available else "disconnected"
    if not RedisHealthGuard.is_available:
        health_status["status"] = "degraded"
        
    return health_status


@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
    }
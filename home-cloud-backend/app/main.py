from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import start_scheduler
from app.config import get_settings
import logging
from app.database import engine, Base
import app.models.user
import app.models.monitor
import app.alerts.models  # Import alert models

# Routers
from app.routes import auth, monitor as monitor_route, alerts as alerts_route

# ============================================
# Logging
# ============================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)
settings = get_settings()


# ============================================
# Lifespan
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Starting {settings.app_name}...")
    logger.info(f"   Environment: {settings.app_env}")
    logger.info(f"   Debug mode: {settings.debug}")

    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables ensured")

    # ✅ START SCHEDULER HERE
    start_scheduler()
    logger.info("✅ Scheduler started")

    yield

    logger.info(f"🛑 Shutting down {settings.app_name}...")

# ============================================
# Create App FIRST
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
# CORS (AFTER app creation)
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Routers
# ============================================
app.include_router(auth.router)
app.include_router(monitor_route.router)
app.include_router(alerts_route.router)


# ============================================
# Endpoints
# ============================================
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.app_env,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
    }
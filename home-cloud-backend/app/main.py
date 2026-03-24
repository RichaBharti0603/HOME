# app/main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
import logging

# ✅ DB + Models
from app.database import engine, Base
import app.models.user
import app.models.monitor   # IMPORTANT: ensures tables are created

# ✅ Routers
from app.routes import auth, monitor as monitor_route


# ============================================
# ✅ Logging Configuration
# ============================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)
settings = get_settings()


# ============================================
# ✅ Lifespan (Startup + Shutdown)
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):

    # --- STARTUP ---
    logger.info(f"🚀 Starting {settings.app_name}...")
    logger.info(f"   Environment: {settings.app_env}")
    logger.info(f"   Debug mode: {settings.debug}")

    # ✅ Create DB Tables
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables ensured")

    yield

    # --- SHUTDOWN ---
    logger.info(f"🛑 Shutting down {settings.app_name}...")


# ============================================
# ✅ FastAPI App
# ============================================
app = FastAPI(
    title=settings.app_name,
    description="Hyper-Optimized Monitoring Engine — Website monitoring at scale",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)


# ============================================
# ✅ CORS (Frontend Connection)
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# ✅ Routers
# ============================================
app.include_router(auth.router)
app.include_router(monitor_route.router)


# ============================================
# ✅ Health Check
# ============================================
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.app_env,
    }


# ============================================
# ✅ Root Endpoint
# ============================================
@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
    }
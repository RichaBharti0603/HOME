from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import start_scheduler
from app.config import get_settings
import logging
from app.database import engine, Base
import app.models.user
import app.models.monitor
import app.models.log
import app.models.alert
import app.models.incident
import app.models.tenant
import app.models.billing
import app.models.onboarding
from app.core.system_guard import RedisHealthGuard
from app.database import get_db
from app.utils.security import get_current_user
from sqlalchemy.orm import Session
from fastapi import Depends
from app.models.user import User

def run_dynamic_migrations():
    from sqlalchemy import text
    logger.info("Running dynamic migrations check...")
    try:
        with engine.connect() as conn:
            db_name = engine.url.drivername
            column_exists = False
            if "sqlite" in db_name:
                cursor = conn.execute(text("PRAGMA table_info(notification_settings)"))
                cols = [row[1] for row in cursor.fetchall()]
                column_exists = "whatsapp_number" in cols
            else:
                cursor = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name='notification_settings' AND column_name='whatsapp_number'"
                ))
                column_exists = cursor.fetchone() is not None
            
            if not column_exists:
                logger.info("Adding whatsapp_number column to notification_settings table...")
                conn.execute(text("ALTER TABLE notification_settings ADD COLUMN whatsapp_number VARCHAR(80)"))
                conn.commit()
                logger.info("whatsapp_number column added successfully")
            else:
                logger.info("whatsapp_number column already exists")
    except Exception as e:
        logger.error(f"Dynamic migration failed: {e}")

# ============================================
# Routers
# ============================================
from app.routes import auth, monitor as monitor_route, alert, ai, health, billing, engine as engine_route, onboarding

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

from fastapi.responses import JSONResponse

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
        
        # Run dynamic migration check
        run_dynamic_migrations()
    except Exception as e:
        logger.error(f"Failed to database operations: {e}")

    try:
        # Run RedisHealthGuard ping verification in background thread to prevent cold start blocking
        import threading
        def verify_redis():
            RedisHealthGuard.ping_and_verify()
            logger.info(f"Redis Status verified in background thread: {'Available' if RedisHealthGuard.is_available else 'Unavailable'}")
        
        threading.Thread(target=verify_redis, daemon=True).start()
        
        # Phase 2: Conditional Scheduler
        import os
        if os.getenv("ENABLE_SCHEDULER") == "true":
            start_scheduler()
            logger.info("Scheduler started successfully")
        else:
            logger.warning("Scheduler DISABLED via ENABLE_SCHEDULER env var")
    except Exception as e:
        logger.error(f"Failed to start the scheduler: {e}")

    # Log all registered routes for debug visibility
    for route in app.routes:
        logger.info(f"Registered route: {route.path} ({getattr(route, 'methods', 'WS')})")

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
    docs_url="/docs",
    redoc_url="/redoc",
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://home-frontend-fjvl.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def ensure_cors_headers(request, call_next):
    try:
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
            headers={"Access-Control-Allow-Origin": "*"}
        )

# Fix: Register exception handlers AFTER the FastAPI app instance is created.
# Previously, this was above the `app = FastAPI(...)` assignment, causing it 
# to try and add a handler to the `app` module (from `import app.models...`).
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"CRASH: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
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
app.include_router(onboarding.router)
from fastapi import WebSocket, WebSocketDisconnect
from app.utils.websocket_manager import manager

app.include_router(ai.router)

# ============================================
# Endpoints
# ============================================
@app.get("/users/me", tags=["Auth"])
def get_me_direct(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant = current_user.tenant
    return {
        "id": current_user.id,
        "email": current_user.email,
        "tenant_id": current_user.tenant_id,
        "onboarding_complete": tenant.onboarding_complete if tenant else False,
        "subscription_plan": tenant.subscription_plan if tenant else "none",
        "payment_status": tenant.payment_status if tenant else "none"
    }

from app.schemas.user import RegisterRequest

@app.post("/register", tags=["Auth"])
async def register_direct(user_in: RegisterRequest, db: Session = Depends(get_db)):
    from app.routes.auth import register
    return await register(user_in, db)

@app.post("/login", tags=["Auth"])
async def login_direct(request: Request, db: Session = Depends(get_db)):
    from app.routes.auth import login
    return await login(request, db)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/test", tags=["System"])
async def test_check():
    return {"status": "ok", "message": "H.O.M.E backend successfully loaded"}

@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
    }

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
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
    from sqlalchemy import inspect, text
    logger.info("Running dynamic migrations check...")
    try:
        with engine.connect() as conn:
            db_name = engine.url.drivername
            inspector = inspect(conn)

            def has_table(table_name: str) -> bool:
                return inspector.has_table(table_name)

            def columns_for(table_name: str) -> set[str]:
                if not has_table(table_name):
                    return set()
                return {column["name"] for column in inspector.get_columns(table_name)}

            user_columns = columns_for("users")
            tenant_columns = columns_for("tenants")

            def add_column_if_missing(table_name: str, column_name: str, ddl: str, existing_columns: set[str]):
                if table_name in inspector.get_table_names() and column_name not in existing_columns:
                    logger.info("Adding %s.%s column...", table_name, column_name)
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {ddl}"))
                    existing_columns.add(column_name)

            add_column_if_missing("users", "tenant_id", "INTEGER", user_columns)
            add_column_if_missing("users", "onboarding_completed", "BOOLEAN DEFAULT FALSE", user_columns)
            add_column_if_missing("users", "whatsapp_number", "VARCHAR", user_columns)
            add_column_if_missing("tenants", "trial_ends_at", "TIMESTAMP", tenant_columns)
            add_column_if_missing("tenants", "onboarding_complete", "BOOLEAN DEFAULT FALSE", tenant_columns)

            column_exists = False
            if has_table("notification_settings") and "sqlite" in db_name:
                cursor = conn.execute(text("PRAGMA table_info(notification_settings)"))
                cols = [row[1] for row in cursor.fetchall()]
                column_exists = "whatsapp_number" in cols
            elif has_table("notification_settings"):
                cursor = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name='notification_settings' AND column_name='whatsapp_number'"
                ))
                column_exists = cursor.fetchone() is not None
            
            if has_table("notification_settings") and not column_exists:
                logger.info("Adding whatsapp_number column to notification_settings table...")
                conn.execute(text("ALTER TABLE notification_settings ADD COLUMN whatsapp_number VARCHAR(80)"))
                logger.info("whatsapp_number column added successfully")
            elif has_table("notification_settings"):
                logger.info("whatsapp_number column already exists")

            conn.commit()
    except Exception as e:
        logger.error(f"Dynamic migration failed: {e}")


def get_cors_origins() -> list[str]:
    configured = [
        "https://home-frontend-fjvl.onrender.com",
        "http://localhost:5173",
        settings.frontend_url,
        *settings.cors_origins.split(","),
    ]
    return sorted({origin.strip().rstrip("/") for origin in configured if origin.strip()})

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
            try:
                RedisHealthGuard.ping_and_verify()
                logger.info(f"Redis Status verified in background thread: {'Available' if RedisHealthGuard.is_available else 'Unavailable'}")
            except Exception as e:
                logger.error(f"Redis verification failed safely: {e}")
                print("Redis disabled safely")
        
        threading.Thread(target=verify_redis, daemon=True).start()
        
        # Phase 2: Conditional Scheduler
        import os
        if os.getenv("ENABLE_SCHEDULER") == "true":
            try:
                start_scheduler()
                logger.info("Scheduler started successfully")
            except Exception as e:
                logger.warning(f"Scheduler failed to start safely: {e}")
                print("Scheduler disabled safely")
        else:
            logger.warning("Scheduler DISABLED via ENABLE_SCHEDULER env var")
    except Exception as e:
        logger.error(f"Failed to start the background tasks: {e}")

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

# Fix: Register exception handlers AFTER the FastAPI app instance is created.
# Previously, this was above the `app = FastAPI(...)` assignment, causing it 
# to try and add a handler to the `app` module (from `import app.models...`).
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"CRASH: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Phase 5: Logging Middleware (including Origin tracking)
import time
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    origin = request.headers.get("origin")
    logger.info(f"Incoming: {request.method} {request.url} | Origin: {origin}")
    
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request failure")
        raise
    
    duration = time.time() - start_time
    logger.info(f"Request {request.url} took {duration:.4f}s | Status: {response.status_code}")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
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
app.include_router(engine_route.router)
app.include_router(onboarding.router)
from fastapi import WebSocket, WebSocketDisconnect
from app.utils.websocket_manager import manager

app.include_router(ai.router)



@app.api_route("/health", methods=["GET", "HEAD", "OPTIONS"], include_in_schema=False)
def health(request: Request):
    if request.method in {"HEAD", "OPTIONS"}:
        return Response(status_code=204)
    return {"status": "ok"}

@app.get("/healthz", tags=["System"])
def healthz():
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

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)

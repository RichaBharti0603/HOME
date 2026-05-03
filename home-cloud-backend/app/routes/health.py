from fastapi import APIRouter
from sqlalchemy import text
from app.worker.celery_app import celery_app
from app.config import get_settings
from app.database import engine
from app.core.system_guard import RedisHealthGuard
import redis

router = APIRouter(prefix="/system", tags=["Health"])
settings = get_settings()

@router.get("/health")
def get_system_health():
    """
    Returns deep statistics about the entire monitoring engine.
    """
    health = {
        "status": "healthy",
        "database": "unknown",
        "redis": "unknown",
        "workers": 0,
        "pending_jobs": 0,
        "running_jobs": 0
    }
    
    # Check Database
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        health["database"] = "connected"
    except Exception:
        health["database"] = "disconnected"
        health["status"] = "degraded"
        
    # Check Redis
    if RedisHealthGuard.is_available:
        health["redis"] = "connected"
        try:
            r = redis.Redis.from_url(settings.celery_broker_url, socket_connect_timeout=2)
            
            # Celery stats
            i = celery_app.control.inspect()
            active = i.active() if i else None
            health["workers"] = len(active) if active else 0
            health["pending_jobs"] = r.llen('health_checks')
            health["running_jobs"] = sum(len(tasks) for tasks in active.values()) if active else 0
            
            if health["workers"] == 0:
                health["status"] = "degraded"
        except Exception:
            pass
    else:
        health["redis"] = "disconnected"
        health["status"] = "degraded"
        
    return health

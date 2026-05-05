from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.log import MonitorLog
from app.engine.observability.metrics import MetricsManager
from typing import List

router = APIRouter(prefix="/engine", tags=["Monitoring Engine"])

@router.get("/stats")
def get_engine_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns high-level engine statistics.
    """
    total_checks = db.query(MonitorLog).count()
    recent_errors = db.query(MonitorLog).filter(MonitorLog.status != "UP").order_by(MonitorLog.timestamp.desc()).limit(10).all()
    
    return {
        "total_checks_processed": total_checks,
        "engine_status": "OPERATIONAL",
        "recent_incidents": recent_errors
    }

@router.get("/metrics")
def get_prometheus_metrics():
    """
    Prometheus scrape endpoint.
    """
    return MetricsManager.get_metrics_response()

@router.get("/logs")
def get_detailed_logs(limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns detailed engineering logs for the dashboard.
    """
    logs = db.query(MonitorLog).order_by(MonitorLog.timestamp.desc()).limit(limit).all()
    return logs

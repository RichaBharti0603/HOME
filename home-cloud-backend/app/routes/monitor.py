import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.monitor import Monitor
from app.models.log import MonitorLog
from app.models.incident import Incident
from app.schemas.monitor import MonitorCreate, MonitorResponse, IncidentResponse, URLValidateRequest
from app.schemas.log import MonitorLogResponse
from app.monitoring.checker import MonitoringEngine, check_dns
from app.monitoring.validation import WebsiteRegistrationService
from app.utils.security import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/monitors", tags=["Monitors"])


# ============================================
# VALIDATE URL (WIZARD PREVIEW)
# ============================================
@router.post("/validate")
def validate_url(data: URLValidateRequest):
    result = WebsiteRegistrationService.validate_and_enrich_website(data.url)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# ============================================
# CREATE MONITOR
# ============================================
@router.post("", response_model=MonitorResponse)
def create_monitor(data: MonitorCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    url = str(data.url)
    
    # Proactive Strict Validation Gate
    validation_result = WebsiteRegistrationService.validate_and_enrich_website(url)
    if validation_result.get("error"):
        raise HTTPException(status_code=422, detail=validation_result["error"])
        
    url = validation_result["url"] # Use the normalized URL

    try:
        monitor = Monitor(
            project_name=data.project_name,
            url=url,
            frequency=data.frequency,
            monitor_type=data.monitor_type or "HTTP",
            status="UNKNOWN",
            threshold_ms=data.threshold_ms,
            tenant_id=current_user.tenant_id
        )

        db.add(monitor)
        db.commit()
        db.refresh(monitor)

        return monitor

    except Exception as e:
        logger.error(f"Failed to create monitor: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Engine failure during deployment: {str(e)}")


# ============================================
# GET ALL MONITORS (DASHBOARD)
# ============================================
@router.get("", response_model=List[MonitorResponse])
def get_monitors(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.tenant_id:
        return []
    monitors = db.query(Monitor).filter(Monitor.tenant_id == current_user.tenant_id).all()
    return monitors


# ============================================
# GET ALL INCIDENTS
# ============================================
@router.get("/incidents", response_model=List[IncidentResponse])
def get_all_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(Incident.started_at.desc()).all()
    return incidents


# ============================================
# GET SINGLE MONITOR
# ============================================
@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(monitor_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id, Monitor.tenant_id == current_user.tenant_id).first()

    if not monitor:
        raise HTTPException(status_code=404, detail="Node not found in local mesh.")

    return monitor


# ============================================
# GET ALL MONITOR LOGS (GLOBAL CHART)
# ============================================
@router.get("/all/logs", response_model=List[MonitorLogResponse])
def get_all_monitor_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(MonitorLog).order_by(MonitorLog.timestamp.desc()).limit(limit).all()
    return logs


# ============================================
# GET MONITOR LOGS
# ============================================
@router.get("/{monitor_id}/logs", response_model=List[MonitorLogResponse])
def get_monitor_logs(monitor_id: int, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == monitor_id).order_by(MonitorLog.timestamp.desc()).limit(limit).all()
    return logs


# ============================================
# DELETE MONITOR
# ============================================
@router.delete("/{monitor_id}")
def delete_monitor(monitor_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id, Monitor.tenant_id == current_user.tenant_id).first()

    if not monitor:
        raise HTTPException(status_code=404, detail="Node not found.")

    db.delete(monitor)
    db.commit()

    return {"message": "Node decommissioned successfully."}


# ============================================
# GET MONITOR HISTORY (ASCENDING)
# ============================================
@router.get("/{monitor_id}/history", response_model=List[MonitorLogResponse])
def get_monitor_history(monitor_id: int, db: Session = Depends(get_db)):
    logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == monitor_id).order_by(MonitorLog.timestamp.asc()).all()
    return logs


# ============================================
# GET MONITOR STATS
# ============================================
@router.get("/{monitor_id}/stats")
def get_monitor_stats(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found.")
        
    logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == monitor_id).all()
    
    total_checks = len(logs)
    if total_checks == 0:
        return {"uptime_percent": 100.0, "avg_response_time": 0, "total_checks": 0}
        
    successful_checks = sum(1 for log in logs if log.status == "UP")
    uptime_percent = round((successful_checks / total_checks) * 100, 2)
    
    # Avg response time
    response_times = [log.response_time for log in logs if log.response_time is not None]
    avg_response_time = round(sum(response_times) / len(response_times)) if response_times else 0
    
    # SLA based on uptime
    sla_percent = uptime_percent
    
    return {
        "uptime_percent": uptime_percent,
        "sla_percent": sla_percent,
        "avg_response_time": avg_response_time,
        "total_checks": total_checks
    }
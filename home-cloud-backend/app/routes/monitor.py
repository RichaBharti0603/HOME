import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.monitor import Monitor
from app.models.log import MonitorLog
from app.models.incident import Incident
from app.schemas.monitor import MonitorCreate, MonitorResponse, IncidentResponse
from app.schemas.log import MonitorLogResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="", tags=["Monitors"])


# ============================================
# CREATE MONITOR
# ============================================
@router.post("/monitors", response_model=MonitorResponse)
def create_monitor(data: MonitorCreate, db: Session = Depends(get_db)):
    try:
        monitor = Monitor(
            project_name=data.project_name,
            url=str(data.url),
            frequency=data.frequency,
            monitor_type=data.monitor_type or "HTTP",
            status="UNKNOWN",
            threshold_ms=data.threshold_ms
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
@router.get("/monitors", response_model=List[MonitorResponse])
def get_monitors(db: Session = Depends(get_db)):
    monitors = db.query(Monitor).all()
    return monitors


# ============================================
# GET ALL INCIDENTS
# ============================================
@router.get("/monitors/incidents", response_model=List[IncidentResponse])
def get_all_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(Incident.started_at.desc()).all()
    return incidents


# ============================================
# GET SINGLE MONITOR
# ============================================
@router.get("/monitors/{monitor_id}", response_model=MonitorResponse)
def get_monitor(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(status_code=404, detail="Node not found in local mesh.")

    return monitor


# ============================================
# GET MONITOR LOGS
# ============================================
@router.get("/monitors/{monitor_id}/logs", response_model=List[MonitorLogResponse])
def get_monitor_logs(monitor_id: int, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == monitor_id).order_by(MonitorLog.timestamp.desc()).limit(limit).all()
    return logs


# ============================================
# DELETE MONITOR
# ============================================
@router.delete("/monitors/{monitor_id}")
def delete_monitor(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(status_code=404, detail="Node not found.")

    db.delete(monitor)
    db.commit()

    return {"message": "Node decommissioned successfully."}


# ============================================
# GET MONITOR HISTORY (ASCENDING)
# ============================================
@router.get("/monitors/{monitor_id}/history", response_model=List[MonitorLogResponse])
def get_monitor_history(monitor_id: int, db: Session = Depends(get_db)):
    logs = db.query(MonitorLog).filter(MonitorLog.monitor_id == monitor_id).order_by(MonitorLog.timestamp.asc()).all()
    return logs
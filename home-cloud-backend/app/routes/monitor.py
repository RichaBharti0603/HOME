from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.monitor import Monitor
from app.schemas.monitor import MonitorCreate, MonitorResponse

router = APIRouter(prefix="", tags=["Monitors"])


# ============================================
# CREATE MONITOR (SETUP)
# ============================================
@router.post("/setup", response_model=MonitorResponse)
def create_monitor(data: MonitorCreate, db: Session = Depends(get_db)):
    try:
        monitor = Monitor(
            project_name=data.project_name,
            url=str(data.url),
            frequency=data.frequency,
            monitor_type=data.monitor_type,
            status="UNKNOWN"
        )

        db.add(monitor)
        db.commit()
        db.refresh(monitor)

        return monitor

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# GET ALL MONITORS (DASHBOARD)
# ============================================
@router.get("/monitors", response_model=List[MonitorResponse])
def get_monitors(db: Session = Depends(get_db)):
    monitors = db.query(Monitor).all()
    return monitors


# ============================================
# GET SINGLE MONITOR
# ============================================
@router.get("/monitors/{monitor_id}", response_model=MonitorResponse)
def get_monitor(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    return monitor


# ============================================
# DELETE MONITOR
# ============================================
@router.delete("/monitors/{monitor_id}")
def delete_monitor(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    db.delete(monitor)
    db.commit()

    return {"message": "Monitor deleted successfully"}
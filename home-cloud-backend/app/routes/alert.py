from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(100).all()
    return alerts

@router.post("", response_model=AlertResponse)
def create_alert(data: AlertCreate, db: Session = Depends(get_db)):
    alert = Alert(
        monitor_id=data.monitor_id,
        type=data.type,
        message=data.message
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = True
    db.commit()
    return {"message": "Alert marked as resolved"}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx
from app.database import get_db
from app.models.monitor import Monitor

router = APIRouter()


# Request Schema
class SetupRequest(BaseModel):
    project_name: str
    url: str
    frequency: str
    monitor_type: str


# POST: Create Monitor
@router.post("/setup")
def create_monitor(data: SetupRequest, db: Session = Depends(get_db)):

    new_monitor = Monitor(
        project_name=data.project_name,
        url=data.url,
        frequency=data.frequency,
        monitor_type=data.monitor_type
    )

    db.add(new_monitor)
    db.commit()
    db.refresh(new_monitor)

    return {
        "message": "Monitor created",
        "monitor_id": new_monitor.id
    }


def check_website(url: str):
    try:
        response = httpx.get(url, timeout=5)
        if response.status_code < 400:
            return "UP"
        return "DOWN"
    except Exception:
        return "DOWN"
    
@router.get("/monitors")
def get_monitors(db: Session = Depends(get_db)):
    monitors = db.query(Monitor).all()

    result = []
    for m in monitors:
        status = check_website(m.url)

        result.append({
            "id": m.id,
            "project_name": m.project_name,
            "url": m.url,
            "frequency": m.frequency,
            "monitor_type": m.monitor_type,
            "status": status
        })

    return result
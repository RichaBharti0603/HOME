from fastapi import APIRouter, Depends
from core.database import SessionLocal
from models.alert import Alert
from core.auth import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.post("/")
def create_alert(
    website_id: int,
    channel: str,
    target: str,
    user=Depends(get_current_user),
):
    db = SessionLocal()
    alert = Alert(
        website_id=website_id,
        channel=channel,
        target=target
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    db.close()
    return alert

from fastapi import APIRouter, Depends
from backend.core.auth import get_current_user
from backend.core.database import SessionLocal
from backend.models.incident import Incident
from backend.models.website import Website

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.get("/")
def list_incidents(user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        return (
            db.query(Incident)
            .join(Website)
            .filter(Website.organization_id == user.organization_id)
            .order_by(Incident.started_at.desc())
            .all()
        )
    finally:
        db.close()

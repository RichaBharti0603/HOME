from fastapi import APIRouter, Depends
from datetime import datetime
from backend.core.auth import get_current_user
from backend.core.database import SessionLocal
from backend.services.sla_service import calculate_uptime
from backend.models.website import Website

router = APIRouter(prefix="/api/sla", tags=["SLA"])

@router.get("/{website_id}")
def get_sla(
    website_id: int,
    start: datetime,
    end: datetime,
    user=Depends(get_current_user),
):
    db = SessionLocal()
    try:
        website = (
            db.query(Website)
            .filter(
                Website.id == website_id,
                Website.organization_id == user.organization_id
            )
            .first()
        )
        if not website:
            return {"error": "Website not found"}

        return calculate_uptime(db, website_id, start, end)
    finally:
        db.close()

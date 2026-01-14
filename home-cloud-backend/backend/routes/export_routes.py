import csv
from fastapi import APIRouter, Depends, Response
from core.auth import get_current_user
from core.database import SessionLocal
from models.incident import Incident
from models.website import Website

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.get("/incidents/{website_id}")
def export_incidents(website_id: int, user=Depends(get_current_user)):
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

        incidents = (
            db.query(Incident)
            .filter(Incident.website_id == website_id)
            .all()
        )

        def generate():
            yield "started_at,resolved_at,reason\n"
            for i in incidents:
                yield f"{i.started_at},{i.resolved_at},{i.reason}\n"

        return Response(
            generate(),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=incidents.csv"
            },
        )
    finally:
        db.close()

from fastapi import APIRouter, HTTPException
from core.database import SessionLocal
from models.website import Website

router = APIRouter(prefix="/status", tags=["Public Status"])

@router.get("/{token}")
def public_status(token: str):
    db = SessionLocal()
    website = (
        db.query(Website)
        .filter(Website.public_token == token)
        .first()
    )
    db.close()

    if not website:
        raise HTTPException(status_code=404, detail="Status page not found")

    return {
        "url": website.url,
        "status": website.status,
        "last_checked": website.last_checked,
    }

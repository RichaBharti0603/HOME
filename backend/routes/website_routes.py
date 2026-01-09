from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.core.database import SessionLocal
from backend.models.website import Website
from backend.core.auth import get_current_user
from datetime import datetime
from sqlalchemy import func
from fastapi import APIRouter, HTTPException
from backend.core.database import SessionLocal
from backend.models.website_check import WebsiteCheck


router = APIRouter(prefix="/api/websites", tags=["Websites"])

class WebsiteCreate(BaseModel):
    url: str

@router.post("/register")
def register_website(
    payload: WebsiteCreate,
    user=Depends(get_current_user)
):
    require_role(user, ["OWNER", "ADMIN"])

    db = SessionLocal()
    try:
        site = Website(
            url=payload.url,
            organization_id=user.organization_id
        )
        db.add(site)
        db.commit()
        db.refresh(site)
        return site
    finally:
        db.close()


@router.get("/status")
def get_websites_status(user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        websites = (
            db.query(Website)
            .filter(Website.owner_id == user.id)
            .all()
        )

        return [
            {
                "id": w.id,
                "url": w.url,
                "is_up": w.is_up,
                "status_code": w.last_status_code,
                "response_time": w.last_response_time,
                "last_checked_at": w.last_checked_at,
            }
            for w in websites
        ]
    finally:
        db.close()


@router.get("/dashboard")
def dashboard_overview(user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        websites = (
            db.query(Website)
            .filter(Website.owner_id == user.id)
            .order_by(Website.last_checked_at.desc())
            .all()
        )

        total = len(websites)
        up = sum(1 for w in websites if w.is_up)
        down = total - up

        return {
            "summary": {
                "total": total,
                "up": up,
                "down": down,
                "uptime_percentage": round((up / total) * 100, 2) if total else 0
            },
            "websites": [
                {
                    "id": w.id,
                    "url": w.url,
                    "is_up": w.is_up,
                    "status_code": w.last_status_code,
                    "response_time": w.last_response_time,
                    "last_checked_at": w.last_checked_at
                }
                for w in websites
            ]
        }
    finally:
        db.close()


@router.get("/updates")
def website_updates(
    since: datetime,
    user=Depends(get_current_user)
):
    db = SessionLocal()
    try:
        updates = (
            db.query(Website)
            .filter(
                Website.owner_id == user.id,
                Website.last_checked_at > since
            )
            .all()
        )

        return [
            {
                "id": w.id,
                "is_up": w.is_up,
                "status_code": w.last_status_code,
                "response_time": w.last_response_time,
                "last_checked_at": w.last_checked_at
            }
            for w in updates
        ]
    finally:
        db.close()

@router.get("/api/websites/{website_id}/history")
def get_website_history(website_id: int, limit: int = 100):
    db = SessionLocal()
    history = (
        db.query(WebsiteCheck)
        .filter(WebsiteCheck.website_id == website_id)
        .order_by(WebsiteCheck.checked_at.desc())
        .limit(limit)
        .all()
    )
    db.close()

    if not history:
        raise HTTPException(status_code=404, detail="No history found")

    return [
        {"status": h.status, "response_time_ms": h.response_time_ms, "checked_at": h.checked_at}
        for h in history
    ]
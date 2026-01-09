import requests
from datetime import datetime
from backend.core.database import SessionLocal
from backend.models.website import Website
from backend.models.incident import Incident
from backend.services.alert_service import dispatch_alerts


def register_website(url: str, user_id: int):
    db = SessionLocal()

    existing = (
        db.query(Website)
        .filter(Website.url == url, Website.owner_id == user_id)
        .first()
    )

    if existing:
        db.close()
        return {"message": "Website already registered"}

    site = Website(url=url, owner_id=user_id)
    db.add(site)
    db.commit()
    db.refresh(site)
    db.close()

    return {"message": "Website registered", "url": url}


def get_user_websites(user_id: int):
    db = SessionLocal()
    sites = db.query(Website).filter(Website.owner_id == user_id).all()

    result = [
        {
            "id": s.id,
            "url": s.url,
            "status": s.status,
            "last_checked": s.last_checked,
        }
        for s in sites
    ]

    db.close()
    return result


def run_monitoring_cycle():
    db = SessionLocal()
    websites = db.query(Website).all()

    for site in websites:
        is_up = check_website_status(site.url)

        if is_up and site.status == "down":
            site.status = "up"
            dispatch_alerts(
                db,
                site,
                f"✅ {site.url} is back UP"
            )

        elif not is_up and site.status == "up":
            site.status = "down"
            dispatch_alerts(
                db,
                site,
                f"🚨 {site.url} is DOWN"
            )

        db.commit()
    db.close()

import requests
from datetime import datetime
from backend.core.database import SessionLocal
from backend.models.website import Website
from backend.utils.alerts import send_email
from backend.models.website_check import WebsiteCheck


def check_websites():
    db = SessionLocal()
    websites = db.query(Website).all()

    if not websites:
        db.close()
        return  # IMPORTANT: prevents empty loop

    for site in websites:
        try:
            response = requests.get(site.url, timeout=5)
            new_status = "up" if response.status_code < 400 else "down"
        except Exception:
            new_status = "down"

        # Detect status change
        if site.status != new_status:
            if new_status == "down":
                send_email(
                    to_email="user@example.com",
                    subject="🚨 Website Down",
                    body=f"{site.url} is DOWN"
                )
            else:
                send_email(
                    to_email="user@example.com",
                    subject="✅ Website Recovered",
                    body=f"{site.url} is BACK UP"
                )

        site.last_status = site.status
        site.status = new_status
        site.last_checked = datetime.utcnow()

    db.commit()
    db.close()


def check_websites():
    db = SessionLocal()
    websites = db.query(Website).all()

    if not websites:
        db.close()
        return

    for site in websites:
        try:
            start = time.time()
            response = requests.get(site.url, timeout=5)
            response_time_ms = int((time.time() - start) * 1000)
            new_status = "up" if response.status_code < 400 else "down"
        except Exception:
            new_status = "down"
            response_time_ms = None

        # Store history
        check_entry = WebsiteCheck(
            website_id=site.id,
            status=new_status,
            response_time_ms=response_time_ms
        )
        db.add(check_entry)

        # State change alerts (existing logic)
        if site.status != new_status:
            if new_status == "down":
                send_email(...)
            else:
                send_email(...)

        site.last_status = site.status
        site.status = new_status
        site.last_checked = datetime.utcnow()

    db.commit()
    db.close()


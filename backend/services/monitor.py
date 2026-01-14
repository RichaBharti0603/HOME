import requests
from datetime import datetime
from core.database import SessionLocal
from models.website import Website
from utils.alerts import send_email
from models.website_check import WebsiteCheck


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
        return

    for website in websites:
        try:
            response = requests.get(website.url, timeout=5)
            website.status = "up" if response.status_code == 200 else "down"
        except Exception:
            website.status = "down"

        db.commit()

        # ✅ THIS IS THE CORRECT PLACE
        print(f"Checked {website.url} → {website.status}")

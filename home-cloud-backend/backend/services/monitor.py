from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.website import Website
import requests
from datetime import datetime

def check_websites():
    db: Session = SessionLocal()

    websites = db.query(Website).filter(Website.is_active == True).all()

    for site in websites:
        try:
            response = requests.get(site.url, timeout=10)
            site.last_status = "UP" if response.status_code == 200 else "DOWN"
        except:
            site.last_status = "DOWN"

        site.last_checked = datetime.utcnow()

    db.commit()
    db.close()

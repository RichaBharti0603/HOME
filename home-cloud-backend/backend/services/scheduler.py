import time
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.website import Website
from backend.models.monitor_job import MonitorJob

SCHEDULER_INTERVAL = 30  # seconds

def scheduler_loop():
    while True:
        db: Session = SessionLocal()

        try:
            websites = (
                db.query(Website)
                .filter(Website.is_active == True)
                .all()
            )

            for site in websites:
                job = MonitorJob(
                    website_id=site.id,
                    tenant_id=site.tenant_id,
                )
                db.add(job)

            db.commit()

        finally:
            db.close()

        time.sleep(SCHEDULER_INTERVAL)

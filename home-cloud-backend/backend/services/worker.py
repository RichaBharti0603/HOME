import time
import requests
from datetime import datetime

from core.database import SessionLocal
from models.monitor_job import MonitorJob
from models.website import Website
from services.failure_classifier import classify_failure

def process_jobs():
    db = SessionLocal()

    try:
        job = (
            db.query(MonitorJob)
            .filter(MonitorJob.status == "pending")
            .order_by(MonitorJob.created_at)
            .first()
        )

        if not job:
            return

        website = db.query(Website).get(job.website_id)

        response = None
        exception = None
        start = time.time()

        try:
            response = requests.get(website.url, timeout=5)
        except Exception as e:
            exception = e

        elapsed_ms = int((time.time() - start) * 1000)

        failure_type = classify_failure(
            response=response,
            exception=exception,
            response_time_ms=elapsed_ms
        )

        website.last_checked = datetime.utcnow()
        website.response_time_ms = elapsed_ms
        website.failure_type = failure_type.value
        website.last_status = (
            str(response.status_code) if response else "ERROR"
        )

        job.status = "done"
        job.executed_at = datetime.utcnow()

        db.commit()

    finally:
        db.close()

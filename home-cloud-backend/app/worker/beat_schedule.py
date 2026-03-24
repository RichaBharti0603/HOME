# app/worker/beat_schedule.py
# WHY: Celery Beat is like cron — it sends tasks to the queue
# on a schedule. Without Beat, tasks only run when manually triggered.
# Beat runs as a SEPARATE process alongside workers.

from celery.schedules import crontab
from app.worker.celery_app import celery_app


# This dict defines WHAT runs and WHEN
# We'll add real tasks in Phase 5 — this is the skeleton
celery_app.conf.beat_schedule = {
    # Example: run monitoring sweep every 5 minutes
    # We'll wire this to real task in Phase 5
    "run-monitoring-sweep": {
        "task": "app.worker.tasks.run_all_monitors",   # Task to call
        "schedule": 300.0,                              # Every 300 seconds (5 min)
        # Alternative: use crontab for cron-style scheduling
        # "schedule": crontab(minute="*/5"),
    },
}

# WHY separate file? Beat schedule can get large.
# Keeping it separate means you can change schedules
# without touching Celery app config or task logic.
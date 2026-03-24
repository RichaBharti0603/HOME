# app/worker/tasks.py
# WHY: Tasks are the units of work Celery executes.
# This file is the skeleton — real logic gets added in Phase 2+.
# The @celery_app.task decorator registers the function with Celery.

from app.worker.celery_app import celery_app
import logging

logger = logging.getLogger(__name__)


@celery_app.task(
    name="app.worker.tasks.run_all_monitors",  # Explicit name (best practice)
                                                # Without this, renaming the
                                                # function breaks queued tasks
    bind=True,          # 'bind=True' gives access to 'self' (the task instance)
                        # Needed for retries: self.retry(exc=e)
    max_retries=3,      # Retry failed tasks up to 3 times
    default_retry_delay=60,  # Wait 60 seconds between retries
)
def run_all_monitors(self):
    """
    Master task: fetches all active monitors from DB and
    dispatches individual check tasks for each one.
    
    This is the 'fan-out' pattern:
    1 master task → N individual check tasks (one per URL)
    """
    logger.info("🔍 Starting monitoring sweep...")
    # Full implementation in Phase 5
    # For now, just confirm Celery is working
    return {"status": "sweep_started", "monitors_checked": 0}


@celery_app.task(
    name="app.worker.tasks.check_single_monitor",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def check_single_monitor(self, monitor_id: str):
    """
    Check a single URL monitor.
    Called by run_all_monitors for each registered URL.
    Full implementation in Phase 2 + Phase 5.
    """
    logger.info(f"Checking monitor: {monitor_id}")
    return {"monitor_id": monitor_id, "status": "pending"}
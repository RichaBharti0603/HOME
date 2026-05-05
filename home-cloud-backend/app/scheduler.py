import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.monitor import Monitor
from app.core.system_guard import RedisHealthGuard

logger = logging.getLogger(__name__)

# Setup scheduler with production bounds
# max_instances=5: Prevents the same job from piling up if workers are slow
# coalesce=True: If multiple runs of a job are pending, combine them into one
# misfire_grace_time=30: If a job misses its window by 30s (e.g. due to CPU load), still run it
scheduler = BackgroundScheduler({
    'apscheduler.job_defaults.max_instances': '5',
    'apscheduler.job_defaults.coalesce': 'True',
    'apscheduler.job_defaults.misfire_grace_time': '30',
})

def freq_to_seconds(freq: str) -> int:
    try:
        if freq.endswith('s'):
            return max(15, int(freq[:-1])) # Enforce minimum 15s
        if freq.endswith('m'):
            return max(15, int(freq[:-1]) * 60)
        return max(15, int(freq))
    except Exception:
        return 60

class SchedulerOrchestrator:
    @staticmethod
    def sync_monitors():
        """
        Polls the database and reconciles the in-memory APScheduler jobs.
        Adds missing jobs, removes deleted monitors, updates changed frequencies.
        """
        db: Session = SessionLocal()
        try:
            # We fetch all active monitors
            monitors = db.query(Monitor).filter(Monitor.active_status == True).all()
            
            # Current jobs in APScheduler
            existing_jobs = {job.id: job for job in scheduler.get_jobs()}
            active_monitor_ids = set()

            for monitor in monitors:
                job_id = f"monitor_{monitor.id}"
                active_monitor_ids.add(job_id)
                interval_sec = freq_to_seconds(monitor.frequency)
                
                if job_id not in existing_jobs:
                    # Add new job
                    from app.worker.tasks import dispatch_monitor_check
                    scheduler.add_job(
                        dispatch_monitor_check,
                        trigger=IntervalTrigger(seconds=interval_sec),
                        args=[monitor.id],
                        id=job_id,
                        name=f"Monitor {monitor.project_name}",
                        replace_existing=True
                    )
                    if RedisHealthGuard.is_available:
                        logger.info(f"Added scheduler job for monitor {monitor.id} via Redis Celery ({interval_sec}s)")
                    else:
                        logger.info(f"Added scheduler job for monitor {monitor.id} with local fallback ({interval_sec}s)")
                else:
                    # Check if frequency changed
                    job = existing_jobs[job_id]
                    if job.trigger.interval.total_seconds() != interval_sec:
                        scheduler.reschedule_job(job_id, trigger=IntervalTrigger(seconds=interval_sec))
                        logger.info(f"Updated scheduler interval for monitor {monitor.id} to {interval_sec}s")

            # Remove jobs for monitors that were deleted or paused
            for job_id in list(existing_jobs.keys()):
                if job_id.startswith("monitor_") and job_id not in active_monitor_ids:
                    scheduler.remove_job(job_id)
                    logger.info(f"Removed orphaned scheduler job {job_id}")

        except Exception as e:
            logger.error(f"Scheduler sync failed: {e}")
        finally:
            db.close()

def start_scheduler():
    # Sync every 30 seconds to catch new monitors quickly
    scheduler.add_job(
        SchedulerOrchestrator.sync_monitors, 
        "interval", 
        seconds=30, 
        id="sync_orchestrator",
        name="Scheduler Orchestrator Sync"
    )
    scheduler.start()
    
    # Run an immediate sync on startup
    SchedulerOrchestrator.sync_monitors()
    logger.info("Advanced Scheduler started (Dynamic Per-Monitor Resolution)")
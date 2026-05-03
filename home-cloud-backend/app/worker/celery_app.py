# app/worker/celery_app.py
# WHY: Celery needs a central "app" object — similar to how FastAPI
# has an "app" object. This is the Celery instance everything imports.

from celery import Celery
from app.config import get_settings

settings = get_settings()


def create_celery_app() -> Celery:
    """
    Factory function to create and configure the Celery application.
    
    Celery needs two things to work:
    1. A BROKER  — where tasks are SENT (Redis queue)
    2. A BACKEND — where RESULTS are STORED (also Redis here)
    """
    celery_app = Celery(
        "home",                          # App name (shows in logs)
        broker=settings.celery_broker_url,       # Tasks go INTO Redis
        backend=settings.celery_result_backend,  # Results come OUT of Redis
    )

    celery_app.conf.update(
        # Serialization: JSON is safer than pickle (default)
        # Pickle can execute arbitrary code — security risk in production
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],

        # Timezone: always use UTC in backend systems
        # Local timezones cause bugs with DST (daylight saving time)
        timezone="UTC",
        enable_utc=True,

        # Task result expiry: don't store results forever
        # 1 hour is enough for debugging; results pile up otherwise
        result_expires=3600,

        # Retry policy: if the broker is temporarily down,
        # Celery will retry the connection up to 5 times
        broker_connection_retry_on_startup=True,
        broker_connection_max_retries=5,

        # Worker settings
        worker_prefetch_multiplier=1,    # Each worker takes 1 task at a time
                                         # Prevents one slow task from starving others
        task_acks_late=True,             # Acknowledge task AFTER completion
                                         # If worker crashes mid-task, task re-queues

        # Queue routing
        task_routes={
            'app.worker.tasks.check_single_monitor': {'queue': 'health_checks'},
            'app.worker.tasks.run_all_monitors': {'queue': 'health_checks'},
            # Alerts and AI tasks to be assigned queues when implemented
        },
        task_default_queue='health_checks',
    )

    return celery_app


# Create the global Celery instance
# All other modules import THIS object
celery_app = create_celery_app()
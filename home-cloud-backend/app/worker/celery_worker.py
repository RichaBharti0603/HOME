from celery import Celery

celery = Celery(
    "home_worker",
    broker="redis://redis:6379/0"
)
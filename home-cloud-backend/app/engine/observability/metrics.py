from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
import time

# Metrics definitions
MONITOR_CHECKS_TOTAL = Counter(
    "home_monitor_checks_total",
    "Total number of monitor checks",
    ["status", "target"]
)

RESPONSE_TIME_SECONDS = Histogram(
    "home_monitor_response_time_seconds",
    "Response time of monitor checks in seconds",
    ["target"]
)

ACTIVE_MONITORS = Gauge(
    "home_monitor_active_monitors",
    "Number of currently active monitors"
)

CELERY_QUEUE_DEPTH = Gauge(
    "home_celery_queue_depth",
    "Number of tasks in the celery queue"
)

class MetricsManager:
    @staticmethod
    def record_check(target: str, status: str, duration_ms: float):
        MONITOR_CHECKS_TOTAL.labels(status=status, target=target).inc()
        RESPONSE_TIME_SECONDS.labels(target=target).observe(duration_ms / 1000.0)

    @staticmethod
    def get_metrics_response():
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

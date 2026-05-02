# app/worker/tasks.py
# WHY: Tasks are the units of work Celery executes.
# This file is the skeleton — real logic gets added in Phase 2+.
# The @celery_app.task decorator registers the function with Celery.

from app.worker.celery_app import celery_app
from app.database import SessionLocal
from app.models.monitor import Monitor
from app.models.log import MonitorLog
from app.models.incident import Incident
from app.models.alert import Alert
from app.monitoring.checker import MonitoringEngine
from app.monitoring.classifier import classify_failure
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@celery_app.task(name="app.worker.tasks.run_all_monitors")
def run_all_monitors():
    """
    Fetches all monitors and dispatches check tasks.
    """
    db = SessionLocal()
    try:
        monitors = db.query(Monitor).all()
        for m in monitors:
            check_single_monitor.delay(m.id)
        return {"status": "dispatched", "count": len(monitors)}
    finally:
        db.close()


@celery_app.task(
    name="app.worker.tasks.check_single_monitor",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def check_single_monitor(self, monitor_id: int):
    db = SessionLocal()
    try:
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
        if not monitor:
            return {"error": "Monitor not found"}

        result = MonitoringEngine.run_full_check(monitor.url)
        classification = classify_failure(result)
        
        # Determine status
        status = result.status.value.upper()
        prev_status = monitor.status
        
        # Update Monitor
        monitor.status = status
        monitor.last_checked = datetime.utcnow()
        monitor.last_response_time = int(result.total_duration_ms)
        
        # Log Result
        log = MonitorLog(
            monitor_id=monitor.id,
            status=status,
            response_time=int(result.total_duration_ms),
            error_message=classification["explanation"],
            dns_ms=int(result.dns.duration_ms) if result.dns else None,
            tcp_ms=int(result.tcp.duration_ms) if result.tcp else None,
            http_ms=int(result.http.response_time_ms) if result.http else None
        )
        db.add(log)

        # Incident Logic
        if status == "DOWN" and prev_status != "DOWN":
            # New incident
            incident = Incident(
                monitor_id=monitor.id,
                status="OPEN",
                severity=classification["severity"],
                summary=f"Monitor {monitor.project_name} is DOWN: {classification['type']}",
                root_cause=classification["explanation"]
            )
            db.add(incident)
            
            # Send alert
            alert = Alert(
                monitor_id=monitor.id,
                type="DOWN",
                message=f"CRITICAL: {monitor.project_name} is down. {classification['explanation']}"
            )
            db.add(alert)

        elif status == "UP" and prev_status == "DOWN":
            # Resolve incident
            open_incident = db.query(Incident).filter(
                Incident.monitor_id == monitor.id,
                Incident.status == "OPEN"
            ).first()
            
            if open_incident:
                open_incident.status = "RESOLVED"
                open_incident.resolved_at = datetime.utcnow()
            
            # Recovery alert
            alert = Alert(
                monitor_id=monitor.id,
                type="RECOVERY",
                message=f"RECOVERY: {monitor.project_name} is back online."
            )
            db.add(alert)

        db.commit()
        
        # Trigger WebSocket update (placeholder for Phase 3)
        # broadcast_status_change(monitor_id, status)
        
        return {"monitor_id": monitor_id, "status": status}
    except Exception as e:
        db.rollback()
        logger.error(f"Error checking monitor {monitor_id}: {e}")
        raise self.retry(exc=e)
    finally:
        db.close()
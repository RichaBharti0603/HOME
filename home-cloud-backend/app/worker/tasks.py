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
from app.engine.orchestrator.scheduler import MonitoringOrchestrator
from app.alerts.engine import AlertPolicyEngine
from app.core.system_guard import RedisHealthGuard
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def dispatch_monitor_check(monitor_id: int):
    """
    Dispatch monitor check through Celery when Redis is available.
    Fallback to local execution in development when Redis is down.
    """
    if RedisHealthGuard.is_available:
        check_single_monitor.delay(monitor_id)
        return
    # Run task in-process to keep monitoring functional without Redis.
    check_single_monitor.apply(args=[monitor_id], throw=False)


@celery_app.task(name="app.worker.tasks.run_all_monitors")
def run_all_monitors():
    """
    Fetches all monitors and dispatches check tasks.
    """
    db = SessionLocal()
    try:
        monitors = db.query(Monitor).all()
        for m in monitors:
            dispatch_monitor_check(m.id)
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

        # Run Advanced Engine
        engine_result = MonitoringOrchestrator.run_full_pipeline(
            url=monitor.url,
            expected_keyword=monitor.expected_keyword
        )
        
        # Determine status
        status = engine_result["status"]
        prev_status = monitor.status
        
        # Map classification from engine_result
        classification = {
            "severity": "Critical" if status == "DOWN" else "Warning" if status == "DEGRADED" else "Recovery",
            "type": "NETWORK_FAILURE" if not engine_result["network"]["reachable"] else "HTTP_FAILURE" if not engine_result["http"]["success"] else "CONTENT_CHANGE" if status == "DEGRADED" else "HEALTHY",
            "explanation": engine_result["http"].get("error") or engine_result["network"].get("error") or "Service is responding normally."
        }
        
        # Update Monitor
        monitor.status = status
        monitor.last_checked = datetime.utcnow()
        monitor.last_response_time = int(engine_result["http"]["total_time"]) if engine_result["http"]["total_time"] else 0
        
        # Log Result with deep metrics
        log = MonitorLog(
            monitor_id=monitor.id,
            status=status,
            response_time=int(engine_result["http"]["total_time"]) if engine_result["http"]["total_time"] else 0,
            error_message=engine_result["http"].get("error"),
            dns_ms=int(engine_result["network"]["dns_time"]) if engine_result["network"]["dns_time"] else None,
            tcp_ms=int(engine_result["network"]["tcp_time"]) if engine_result["network"]["tcp_time"] else None,
            http_ms=int(engine_result["http"]["total_time"]) if engine_result["http"]["total_time"] else None,
            ssl_issuer=engine_result["http"].get("tls_issuer"),
            tls_handshake_ms=int(engine_result["http"]["tls_time"]) if engine_result["http"]["tls_time"] else None,
            ttfb_ms=int(engine_result["http"]["ttfb"]) if engine_result["http"]["ttfb"] else None,
            ping_ms=int(engine_result["network"]["latency"]) if engine_result["network"]["latency"] else None,
            html_hash=engine_result["content"].get("content_hash")
        )
        
        # Change Detection logic
        if monitor.last_html_hash and engine_result["content"].get("content_hash"):
            if monitor.last_html_hash != engine_result["content"]["content_hash"]:
                logger.info(f"Content change detected for {monitor.url}")
                # We could trigger a specific "CONTENT_CHANGED" alert here
        
        monitor.last_html_hash = engine_result["content"].get("content_hash")
        db.add(log)

        # Implement Retry Logic
        max_retries = monitor.retry_policy.get("max_retries", 3) if monitor.retry_policy else 3
        alert_engine = AlertPolicyEngine(db)

        # Incident Logic
        if status == "DOWN" or status == "DEGRADED":
            # Count consecutive downs or degraded
            recent_logs = db.query(MonitorLog).filter(
                MonitorLog.monitor_id == monitor.id
            ).order_by(MonitorLog.timestamp.desc()).limit(max_retries).all()
            
            consecutive_failures = sum(1 for l in recent_logs if l.status in ["DOWN", "DEGRADED"])
            
            if consecutive_failures >= max_retries:
                # Check if there is already an open incident
                open_incident = db.query(Incident).filter(
                    Incident.monitor_id == monitor.id,
                    Incident.status == "OPEN"
                ).first()
                
                if not open_incident:
                    # Real failure crossed the threshold
                    incident = Incident(
                        monitor_id=monitor.id,
                        status="OPEN",
                        severity=classification["severity"],
                        summary=f"Monitor {monitor.project_name} is {status}: {classification['type']}",
                        root_cause=classification["explanation"]
                    )
                    db.add(incident)
                    
                    # Send alert via Policy Engine
                    msg = f"{classification['severity'].upper()}: {monitor.project_name} is {status}. {classification['explanation']}"
                    alert_engine.process_incident(monitor, incident, status, msg)
            else:
                if prev_status == "UP":
                    logger.info(f"Monitor {monitor.id} failed ({consecutive_failures}/{max_retries}). Retrying before alert.")

        elif status == "UP" and prev_status in ["DOWN", "DEGRADED"]:
            # Resolve incident
            open_incident = db.query(Incident).filter(
                Incident.monitor_id == monitor.id,
                Incident.status == "OPEN"
            ).first()
            
            if open_incident:
                open_incident.status = "RESOLVED"
                open_incident.resolved_at = datetime.utcnow()
            
                # Recovery alert
                msg = f"RECOVERY: {monitor.project_name} is back online and healthy."
                alert_engine.process_incident(monitor, open_incident, "RECOVERY", msg)

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
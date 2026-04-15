from app.worker.celery_app import celery_app
from app.database import SessionLocal
from app.models.monitor import Monitor
from app.monitoring.checker import MonitoringEngine
from app.alerts.service import AlertService
import logging

logger = logging.getLogger(__name__)


@celery_app.task(
    name="app.worker.tasks.run_all_monitors",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def run_all_monitors(self):
    db = SessionLocal()
    
    try:
        monitors = db.query(Monitor).all()
        
        if not monitors:
            logger.warning("No monitors found")
            return {"status": "complete", "monitors_checked": 0}
        
        logger.info(f"Dispatching {len(monitors)} monitoring tasks")
        
        for monitor in monitors:
            check_single_monitor.delay(monitor.id)
        
        return {
            "status": "dispatched",
            "monitors_checked": len(monitors),
            "message": f"Dispatched {len(monitors)} monitoring tasks"
        }
    
    except Exception as e:
        logger.error(f"Error in run_all_monitors: {type(e).__name__}: {e}")
        raise
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
            logger.warning(f"Monitor {monitor_id} not found")
            return {"monitor_id": monitor_id, "status": "not_found"}
        
        logger.info(f"Checking monitor {monitor_id}: {monitor.url}")
        
        check_result = MonitoringEngine.run_full_check(monitor.url)
        monitor.status = check_result.status.value.upper()
        db.commit()
        
        logger.info(f"Monitor {monitor_id} check result: {monitor.status}")
        
        alert_sent = AlertService.send_alert(
            db=db,
            monitor_id=monitor_id,
            check_result=check_result
        )
        
        return {
            "monitor_id": monitor_id,
            "url": monitor.url,
            "status": monitor.status,
            "alert_sent": alert_sent,
            "check_duration_ms": check_result.total_duration_ms,
        }
    
    except Exception as e:
        logger.error(f"Error checking monitor {monitor_id}: {type(e).__name__}: {e}")
        
        try:
            raise self.retry(exc=e, countdown=self.request.retries * 30)
        except:
            return {
                "monitor_id": monitor_id,
                "status": "error",
                "error": str(e),
                "retries_exhausted": True,
            }
    finally:
        db.close()
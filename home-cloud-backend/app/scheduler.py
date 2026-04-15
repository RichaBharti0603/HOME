import logging
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.monitor import Monitor
from app.monitoring.checker import MonitoringEngine
from app.alerts.service import AlertService

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def check_monitors():
    db: Session = SessionLocal()

    try:
        monitors = db.query(Monitor).all()

        if not monitors:
            logger.warning("No monitors found")
            return

        logger.info(f"Starting monitoring sweep ({len(monitors)} monitors)")
        
        checked_count = 0
        alerts_triggered = 0

        for monitor in monitors:
            try:
                logger.debug(f"Checking: {monitor.url}")

                check_result = MonitoringEngine.run_full_check(monitor.url)
                monitor.status = check_result.status.value.upper()
                db.commit()
                
                logger.info(f"Check complete: {monitor.url} → {monitor.status}")

                alert_sent = AlertService.send_alert(
                    db=db,
                    monitor_id=monitor.id,
                    check_result=check_result
                )
                
                if alert_sent:
                    alerts_triggered += 1
                
                checked_count += 1

            except Exception as e:
                logger.error(f"Check failed for {monitor.url}: {type(e).__name__}: {e}")
                monitor.status = "UNKNOWN"
                db.commit()

        logger.info(
            f"Monitoring sweep complete | "
            f"Checked: {checked_count} | Alerts: {alerts_triggered}"
        )

    except Exception as e:
        logger.error(f"Scheduler error: {type(e).__name__}: {e}")
    finally:
        db.close()


# ============================================
# START SCHEDULER
# ============================================
def start_scheduler():
    scheduler.add_job(check_monitors, "interval", seconds=30)
    scheduler.start()
    print("✅ Scheduler started")
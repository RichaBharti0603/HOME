import time
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.monitor import Monitor
from app.models.log import MonitorLog
from app.models.alert import Alert

scheduler = BackgroundScheduler()

# Helper to convert frequency string to seconds
def freq_to_seconds(freq: str) -> int:
    try:
        if freq.endswith('s'):
            return int(freq[:-1])
        if freq.endswith('m'):
            return int(freq[:-1]) * 60
        return int(freq)
    except:
        return 60

from app.monitoring.checker import MonitoringEngine

def perform_check(monitor_id: int):
    db: Session = SessionLocal()
    try:
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
        if not monitor:
            return

        print(f"H.O.M.E Engine -> Checking: {monitor.url}")
        
        result = MonitoringEngine.run_full_check(
            url=monitor.url,
            expected_status=monitor.expected_status,
            expected_keyword=monitor.expected_keyword
        )
        
        status = result.status.value.upper() # UP, DOWN, DEGRADED
        error_msg = result.message
        response_time = int(result.total_duration_ms)

        # Handle Alerts
        previous_status = monitor.status
        if previous_status == "UP" and status == "DOWN":
            # RECOVERY -> DOWN
            alert = Alert(
                monitor_id=monitor.id,
                type="DOWN",
                message=f"Monitor {monitor.project_name} is DOWN. Error: {error_msg}"
            )
            db.add(alert)
        elif previous_status == "DOWN" and status == "UP":
            # DOWN -> UP
            alert = Alert(
                monitor_id=monitor.id,
                type="RECOVERY",
                message=f"Monitor {monitor.project_name} has RECOVERED and is now UP."
            )
            db.add(alert)
        
        # SLOW Alert
        if status == "UP" and response_time and response_time > monitor.threshold_ms:
            alert = Alert(
                monitor_id=monitor.id,
                type="SLOW",
                message=f"Monitor {monitor.project_name} is responding slowly: {response_time}ms"
            )
            db.add(alert)

        # Update Monitor
        monitor.status = status
        monitor.last_checked = datetime.utcnow()
        monitor.last_response_time = response_time
        
        # Store Log
        log = MonitorLog(
            monitor_id=monitor.id,
            status=status,
            response_time=response_time,
            error_message=error_msg,
            timestamp=datetime.utcnow(),
            dns_ms=int(result.dns.duration_ms) if result.dns else None,
            tcp_ms=int(result.tcp.duration_ms) if result.tcp else None,
            http_ms=int(result.http.response_time_ms) if result.http else None
        )
        db.add(log)
        
        db.commit()
    except Exception as e:
        print(f"Scheduler Error for ID {monitor_id}: {str(e)}")
        db.rollback()
    finally:
        db.close()

def check_all_monitors():
    db: Session = SessionLocal()
    try:
        monitors = db.query(Monitor).all()
        now = datetime.utcnow()

        for monitor in monitors:
            freq_sec = freq_to_seconds(monitor.frequency)
            
            # Use a tiny buffer or default if last_checked is None
            if monitor.last_checked is None or (now - monitor.last_checked).total_seconds() >= freq_sec:
                # Dispatch Celery background task
                from app.worker.tasks import check_single_monitor
                check_single_monitor.delay(monitor.id)
    except Exception as e:
        print(f"Main Scheduler Loop Error: {str(e)}")
    finally:
        db.close()

def start_scheduler():
    # Run every 1 second to handle different frequencies precisely
    scheduler.add_job(check_all_monitors, "interval", seconds=1)
    scheduler.start()
    print("Advanced Scheduler started (Resolution: 1s)")
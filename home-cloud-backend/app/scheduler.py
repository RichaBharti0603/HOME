import requests
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.monitor import Monitor


scheduler = BackgroundScheduler()


# ============================================
# CORE MONITORING LOGIC
# ============================================
def check_monitors():
    db: Session = SessionLocal()

    try:
        monitors = db.query(Monitor).all()

        if not monitors:
            print("⚠️ No monitors found")
            return

        for monitor in monitors:
            try:
                print(f"🔍 Checking: {monitor.url}")

                response = requests.get(monitor.url, timeout=5)

                if response.status_code == 200:
                    monitor.status = "UP"
                    print(f"✅ {monitor.url} is UP")
                else:
                    monitor.status = "DOWN"
                    print(f"❌ {monitor.url} is DOWN (Status: {response.status_code})")

            except Exception as e:
                monitor.status = "DOWN"
                print(f"🚨 {monitor.url} failed: {str(e)}")

        db.commit()
        print("💾 Status updated in DB")

    finally:
        db.close()


# ============================================
# START SCHEDULER
# ============================================
def start_scheduler():
    scheduler.add_job(check_monitors, "interval", seconds=30)
    scheduler.start()
    print("✅ Scheduler started")
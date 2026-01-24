import threading
import time
from backend.services.monitoring_service import run_monitoring_cycle

def start_monitoring():
    def loop():
        while True:
            run_monitoring_cycle()
            time.sleep(60)  # check every minute

    thread = threading.Thread(target=loop, daemon=True)
    thread.start()

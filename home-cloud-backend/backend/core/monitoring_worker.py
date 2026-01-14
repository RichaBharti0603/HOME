import time
from services.monitoring_service import run_monitoring_cycle

def start_monitoring():
    import threading
    thread = threading.Thread(target=loop, daemon=True)
    thread.start()

def loop():
    while True:
        run_monitoring_cycle()
        time.sleep(60)

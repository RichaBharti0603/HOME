import time
from services.worker import process_jobs

def worker_loop():
    while True:
        process_jobs()
        time.sleep(5)

import time
import requests

def check_website_status(url: str) -> dict:
    start = time.time()
    try:
        response = requests.get(url, timeout=5)
        response_time = round(time.time() - start, 2)

        return {
            "url": url,
            "status": "UP",
            "status_code": response.status_code,
            "response_time": response_time
        }

    except requests.exceptions.RequestException as e:
        return {
            "url": url,
            "status": "DOWN",
            "error": str(e)
        }

import httpx
import time
import hashlib

async def check_website(url: str):
    start = time.time()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)

        response_time = time.time() - start
        content_hash = hashlib.sha256(response.text.encode()).hexdigest()

        return {
            "status": "UP",
            "status_code": response.status_code,
            "response_time": response_time,
            "content_hash": content_hash,
            "headers": dict(response.headers)
        }

    except Exception:
        return {
            "status": "DOWN",
            "status_code": None,
            "response_time": None,
            "content_hash": None,
            "headers": {}
        }

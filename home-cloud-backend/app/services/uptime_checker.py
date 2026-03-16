import httpx


async def check_website(url):

    try:

        response = httpx.get(url, timeout=10)

        return {
            "status": "up",
            "status_code": response.status_code,
            "response_time": response.elapsed.total_seconds()
        }

    except Exception:

        return {
            "status": "down"
        }
import asyncio
from backend.services.monitoring_service import check_website_status
from backend.services.monitor_store import monitored_websites

async def monitor_loop():
    while True:
        for website_id, website in monitored_websites.items():
            result = check_website_status(website["url"])
            monitored_websites[website_id]["last_status"] = result

        await asyncio.sleep(30)  # check every 30 seconds

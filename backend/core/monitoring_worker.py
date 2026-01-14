import asyncio
from services.monitoring_service import run_monitoring_cycle


async def monitoring_loop():
    while True:
        run_monitoring_cycle()
        await asyncio.sleep(30)  # ⏱ 30s polling

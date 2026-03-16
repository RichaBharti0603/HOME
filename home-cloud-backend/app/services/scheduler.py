import asyncio
from app.db.session import SessionLocal
from app.models.website import Website
from app.services.monitoring import check_website

CHECK_INTERVAL = 60  # seconds

async def monitoring_loop():
    while True:
        print("Running scheduled monitoring...")

        db = SessionLocal()
        try:
            websites = db.query(Website).all()

            for website in websites:
                await check_website(db, website)
        finally:
            db.close()

        await asyncio.sleep(CHECK_INTERVAL)

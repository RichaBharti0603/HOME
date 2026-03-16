from app.models.check_result import CheckResult
from sqlalchemy import desc
from sqlalchemy.orm import Session
import httpx
from app.models.website import Website
from app.models.alert import Alert


FAILURE_THRESHOLD = 3  # consecutive failures

async def check_website(db: Session, website):
    import httpx
    import time

    start = time.time()
    status_code = 0
    response_time = 0

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(website.url, timeout=10)
            status_code = response.status_code
            response_time = int((time.time() - start) * 1000)
    except Exception:
        status_code = 0
        response_time = 0

    result = CheckResult(
        website_id=website.id,
        status_code=status_code,
        response_time=response_time,
    )

    db.add(result)
    db.commit()

    # ---- FAILURE DETECTION ----
    recent_results = (
        db.query(CheckResult)
        .filter(CheckResult.website_id == website.id)
        .order_by(desc(CheckResult.checked_at))
        .limit(FAILURE_THRESHOLD)
        .all()
    )

    if len(recent_results) == FAILURE_THRESHOLD:
        if all(r.status_code == 0 or r.status_code >= 400 for r in recent_results):
            print(f"ALERT: {website.url} is DOWN!")

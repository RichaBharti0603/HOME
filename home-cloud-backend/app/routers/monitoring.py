from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.website import Website
from app.services.monitoring import check_website
from typing import List
from app.models.check_result import CheckResult
from app.schemas.check_result import CheckResultResponse
from app.models.alert import Alert



router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/run")
async def run_checks(db: Session = Depends(get_db)):
    websites = db.query(Website).all()

    for website in websites:
        await check_website(db, website)

    return {"message": "Monitoring completed"}

@router.get("/history/{website_id}", response_model=List[CheckResultResponse])
def get_history(website_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(CheckResult)
        .filter(CheckResult.website_id == website_id)
        .order_by(CheckResult.checked_at.desc())
        .limit(50)
        .all()
    )
    return results

@router.get("/uptime/{website_id}")
def get_uptime(website_id: int, db: Session = Depends(get_db)):
    results = db.query(CheckResult).filter(
        CheckResult.website_id == website_id
    ).all()

    if not results:
        return {"uptime_percentage": 0}

    success_count = sum(1 for r in results if r.status_code and r.status_code < 400)
    total = len(results)

    uptime = (success_count / total) * 100

    return {
        "website_id": website_id,
        "total_checks": total,
        "successful_checks": success_count,
        "uptime_percentage": round(uptime, 2),
    }

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.resolved == False).all()

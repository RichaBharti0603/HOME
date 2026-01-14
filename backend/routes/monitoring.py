from fastapi import APIRouter
from core.database import SessionLocal
from models.website import Website

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

@router.post("/add")
def add_website(url: str, interval: int = 60):
    db = SessionLocal()
    site = Website(url=url, interval=interval)
    db.add(site)
    db.commit()
    db.close()
    return {"message": "Website added for monitoring"}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import SessionLocal
from app.models.website import Website
from app.schemas.website import WebsiteCreate, WebsiteResponse

router = APIRouter(prefix="/websites", tags=["Websites"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=WebsiteResponse)
def create_website(data: WebsiteCreate, db: Session = Depends(get_db)):
    website = Website(url=data.url)
    db.add(website)
    db.commit()
    db.refresh(website)
    return website

@router.get("/", response_model=List[WebsiteResponse])
def get_websites(db: Session = Depends(get_db)):
    return db.query(Website).all()

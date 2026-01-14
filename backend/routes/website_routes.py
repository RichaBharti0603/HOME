from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.website import Website
from pydantic import BaseModel

router = APIRouter(prefix="/api/websites", tags=["Websites"])

class WebsiteCreate(BaseModel):
    name: str
    url: str


@router.get("/")
def list_websites(db: Session = Depends(get_db)):
    return db.query(Website).all()


@router.post("/")
def register_website(
    website: WebsiteCreate,
    db: Session = Depends(get_db),
    x_user_email: str | None = Header(default=None)
):
    new_website = Website(
        name=website.name,
        url=website.url
    )

    db.add(new_website)
    db.commit()
    db.refresh(new_website)

    return {
        "message": "Website registered successfully",
        "website": new_website
    }
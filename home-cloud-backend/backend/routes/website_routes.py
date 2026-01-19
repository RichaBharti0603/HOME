from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import SessionLocal
from core.auth import get_current_user
from models.website import Website
from models.user import User

router = APIRouter()

@router.post("/")
def add_website(url: str, user: User = Depends(get_current_user)):
    db: Session = SessionLocal()

    website = Website(
        url=url,
        user_id=user.id
    )

    db.add(website)
    db.commit()

    return {"message": "Website added"}

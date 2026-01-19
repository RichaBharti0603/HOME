import secrets
from fastapi import APIRouter
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
def register(email: str):
    db: Session = SessionLocal()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return {"error": "User already exists"}

    api_token = secrets.token_hex(32)

    user = User(
        email=email,
        api_token=api_token
    )

    db.add(user)
    db.commit()

    return {
        "email": email,
        "api_token": api_token
    }

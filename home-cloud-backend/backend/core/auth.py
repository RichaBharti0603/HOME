from fastapi import Header, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.user import User

def get_current_user(x_api_key: str = Header(...)):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.api_token == x_api_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return user

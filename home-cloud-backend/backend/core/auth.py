from fastapi import Header, HTTPException
from core.database import SessionLocal
from models.user import User

def get_current_user(x_user_email: str = Header(...)):
    db = SessionLocal()

    user = db.query(User).filter(User.email == x_user_email).first()

    if not user:
        user = User(email=x_user_email)
        db.add(user)
        db.commit()
        db.refresh(user)

    db.close()
    return user

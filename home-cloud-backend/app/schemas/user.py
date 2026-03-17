from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# ✅ NEW (for login)
class UserLogin(BaseModel):
    email: EmailStr
    password: str
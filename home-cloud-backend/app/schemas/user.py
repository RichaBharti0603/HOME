from pydantic import BaseModel, EmailStr, Field, field_validator

class UserBase(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower().strip()

class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)

class UserLogin(UserBase):
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

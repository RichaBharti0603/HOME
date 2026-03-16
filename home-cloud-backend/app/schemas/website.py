from pydantic import BaseModel

class WebsiteCreate(BaseModel):
    url: str

class WebsiteResponse(BaseModel):
    id: int
    url: str

    class Config:
        from_attributes = True  # Required for SQLAlchemy 2.x

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    type: str
    user_id: int
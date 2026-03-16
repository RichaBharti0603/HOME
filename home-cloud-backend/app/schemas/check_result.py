from pydantic import BaseModel
from datetime import datetime

class CheckResultResponse(BaseModel):
    id: int
    website_id: int
    status_code: int
    response_time: int
    checked_at: datetime

    class Config:
        from_attributes = True

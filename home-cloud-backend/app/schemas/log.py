from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MonitorLogResponse(BaseModel):
    id: int
    monitor_id: int
    timestamp: datetime
    status: str
    response_time: Optional[int]
    error_message: Optional[str]

    class Config:
        from_attributes = True

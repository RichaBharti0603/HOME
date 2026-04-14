from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class MonitorCreate(BaseModel):
    project_name: str
    url: HttpUrl
    frequency: str  # e.g., "30s"
    monitor_type: str
    threshold_ms: Optional[int] = 2000


class MonitorResponse(BaseModel):
    id: int
    project_name: str
    url: str
    frequency: str
    monitor_type: str
    status: str
    last_checked: Optional[datetime] = None
    last_response_time: Optional[int] = None
    threshold_ms: int
    created_at: datetime

    class Config:
        from_attributes = True
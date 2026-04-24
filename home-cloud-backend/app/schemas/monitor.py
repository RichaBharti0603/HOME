from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, List

class MonitorCreate(BaseModel):
    project_name: str
    url: HttpUrl
    frequency: str  # e.g., "30s"
    monitor_type: Optional[str] = "HTTP"
    threshold_ms: Optional[int] = 2000


class IncidentResponse(BaseModel):
    id: int
    monitor_id: int
    status: str
    severity: str
    started_at: datetime
    resolved_at: Optional[datetime] = None
    root_cause: Optional[str] = None
    summary: Optional[str] = None

    class Config:
        from_attributes = True


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
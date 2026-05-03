from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, List, Dict, Any

class MonitorBase(BaseModel):
    project_name: str
    url: str
    frequency: str
    monitor_type: str
    check_types: Optional[List[str]] = ["HTTP"]
    alert_policy: Optional[Dict[str, Any]] = {"channels": ["dashboard"]}
    retry_policy: Optional[Dict[str, Any]] = {"max_retries": 3, "delay_seconds": 30}
    active_status: Optional[bool] = True
    expected_status: Optional[int] = None
    expected_keyword: Optional[str] = None
    tenant_id: Optional[int] = None
    threshold_ms: Optional[int] = 2000

class MonitorCreate(MonitorBase):
    pass

class URLValidateRequest(BaseModel):
    url: str


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


class MonitorResponse(MonitorBase):
    id: int
    user_id: Optional[int] = None
    status: str
    last_checked: Optional[datetime] = None
    last_response_time: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
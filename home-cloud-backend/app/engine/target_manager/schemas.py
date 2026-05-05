from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from enum import Enum

class MonitorType(str, Enum):
    HTTP = "http"
    PING = "ping"
    TCP = "tcp"

class TargetBase(BaseModel):
    url: str
    project_name: str
    frequency: str = Field(default="60s", description="Monitoring interval (e.g., 30s, 5m)")
    monitor_type: MonitorType = MonitorType.HTTP
    expected_status: Optional[int] = 200
    expected_keyword: Optional[str] = None
    alert_emails: List[str] = []
    active_status: bool = True

class TargetCreate(TargetBase):
    pass

class TargetUpdate(BaseModel):
    url: Optional[str] = None
    project_name: Optional[str] = None
    frequency: Optional[str] = None
    monitor_type: Optional[MonitorType] = None
    expected_status: Optional[int] = None
    expected_keyword: Optional[str] = None
    alert_emails: Optional[List[str]] = None
    active_status: Optional[bool] = None

class TargetRead(TargetBase):
    id: int
    
    class Config:
        from_attributes = True

class TargetValidation(BaseModel):
    domain: str
    subdomain: Optional[str]
    tld: str
    is_dns_valid: bool
    resolved_ips: List[str] = []

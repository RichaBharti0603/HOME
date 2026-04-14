from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import Optional

class AlertCreate(BaseModel):
    monitor_id: int
    type: str # DOWN, RECOVERY, SLOW
    message: str

class AlertResponse(BaseModel):
    id: int
    monitor_id: int
    type: str
    message: str
    timestamp: datetime
    is_resolved: bool

    @computed_field
    @property
    def project_name(self) -> str:
        return self.monitor.project_name if hasattr(self, 'monitor') and self.monitor else "Unknown"

    class Config:
        from_attributes = True

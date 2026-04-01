from pydantic import BaseModel, HttpUrl

class MonitorCreate(BaseModel):
    project_name: str
    url: HttpUrl
    frequency: int
    monitor_type: str


class MonitorResponse(BaseModel):
    id: int
    project_name: str
    url: str
    frequency: int
    monitor_type: str
    status: str

    class Config:
        from_attributes = True
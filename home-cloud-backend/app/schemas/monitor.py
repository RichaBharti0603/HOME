from pydantic import BaseModel


class MonitorCreate(BaseModel):

    url: str

    check_interval: int

    project_id: int
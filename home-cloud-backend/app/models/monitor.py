from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    monitor_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    status = Column(String, default="UNKNOWN")


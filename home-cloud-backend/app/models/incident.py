from sqlalchemy import Column, String, DateTime, Boolean
from datetime import datetime
import uuid

from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    website_id = Column(String, nullable=False)
    type = Column(String)  # downtime / ssl / compliance
    severity = Column(String)  # low / medium / high / critical
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

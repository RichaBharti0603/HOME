from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from datetime import datetime
import uuid

from core.database import Base


class Website(Base):
    __tablename__ = "websites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    url = Column(String, nullable=False)
    interval_seconds = Column(Integer, default=60)

    status = Column(String, default="PENDING")  # PENDING, ACTIVE, PAUSED
    created_at = Column(DateTime, default=datetime.utcnow)

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.sqlite import BLOB
from datetime import datetime
import uuid

from core.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

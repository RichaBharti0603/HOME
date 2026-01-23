from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from datetime import datetime
import uuid

from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

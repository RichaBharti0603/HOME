from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)

    # Relationships
    tenant = relationship("Tenant", foreign_keys=[tenant_id], backref="users")
    monitors = relationship("Monitor", backref="owner", cascade="all, delete-orphan")
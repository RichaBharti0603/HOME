from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    owner_user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String, nullable=True)
    subscription_plan = Column(String, default="starter") # starter, pro, enterprise
    payment_status = Column(String, default="pending") # pending, active, past_due, canceled
    stripe_customer_id = Column(String, nullable=True)
    onboarding_complete = Column(Boolean, default=False)

    # Relationships
    owner = relationship("User", foreign_keys=[owner_user_id])
    monitors = relationship("Monitor", back_populates="tenant", cascade="all, delete-orphan")
    billings = relationship("Billing", back_populates="tenant", cascade="all, delete-orphan")

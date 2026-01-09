from backend.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    organization_id = Column(Integer, ForeignKey("organizations.id"))
    role = Column(String, default="MEMBER")  # OWNER | ADMIN | MEMBER | VIEWER

    organization = relationship("Organization")

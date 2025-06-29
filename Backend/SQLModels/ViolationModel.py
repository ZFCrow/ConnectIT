from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class ViolationModel(Base):
    __tablename__ = "Violation"

    # primary key
    violationId = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(255), nullable=False)

    # relationships
    postViolations = relationship("PostViolationModel", back_populates="violation")

from dataclasses import Field
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer
from .base import Base
class JobViolationModel(Base):
    __tablename__ = "JobListingViolation"

    jobViolationId = Column(Integer, primary_key=True, autoincrement=True)
    jobId: int = Column( Integer)
    violationId: int = Column(Integer)
    date: datetime = Column(DateTime, default_factory=datetime.utcnow, default=datetime.now)

    
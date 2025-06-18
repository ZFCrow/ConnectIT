from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base

class FieldOfWorkModel(Base):
    __tablename__ = 'FieldOfWork'

    fieldOfWorkId = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(100), unique=True, nullable=False)

    # Reverse relationship to JobListingModel
    job_listing = relationship(
        "JobListingModel",
        back_populates="fieldOfWork",
        lazy="selectin"
    )

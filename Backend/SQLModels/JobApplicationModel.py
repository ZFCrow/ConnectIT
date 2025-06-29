from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, Enum, DateTime, String
from sqlalchemy.orm import relationship

from Entity.JobApplication import Status


def _values(enum_cls):
    """helper so we don’t repeat the lambda everywhere"""
    return [e.value for e in enum_cls]


class JobApplicationModel(Base):
    __tablename__ = "JobApplication"
    applicationId = Column(Integer, primary_key=True, autoincrement=True)
    jobId = Column(Integer, ForeignKey("JobListing.jobId"), nullable=False)
    userId = Column(Integer, ForeignKey("User.userId"), nullable=False)
    status = Column(
        Enum(Status, values_callable=_values, native_enum=True), nullable=False
    )
    # Assuming status is a string like "Applied", "Accepted", "Rejected"
    appliedAt = Column(DateTime, nullable=False)
    resumeURL = Column(String, nullable=False, default="https://www.example.com/")
    jobListing = relationship("JobListingModel", back_populates="jobApplication")
    user = relationship("UserModel", back_populates="jobApplications")

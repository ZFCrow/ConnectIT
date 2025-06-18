from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base
from SQLModels.UserModel import UserModel
from SQLModels.JobListingModel import JobListingModel

class SavedJobModel(Base):
    __tablename__ = "SavedJob"

    savedJobId = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("User.userId"), nullable=False)
    jobListingId = Column(Integer, ForeignKey("JobListing.jobId"), nullable=False)

    # Relationships
    user = relationship("UserModel", lazy="selectin")
    job = relationship("JobListingModel", lazy="selectin")

    # Ensure a user can only bookmark a job once
    __table_args__ = (UniqueConstraint("userId", "jobListingId", name="_user_job_uc"),)

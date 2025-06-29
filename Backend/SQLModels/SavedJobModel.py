from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import Base
from SQLModels.UserModel import UserModel  # noqa: F401
from SQLModels.JobListingModel import JobListingModel  # noqa: F401


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

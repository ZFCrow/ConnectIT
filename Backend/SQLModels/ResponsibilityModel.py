from sqlalchemy import Column, ForeignKey, Integer, String
from .base import Base
from sqlalchemy.orm import relationship


class ResponsibilityModel(Base):
    __tablename__ = "Responsibility"

    responsibilityId = Column(Integer, primary_key=True, autoincrement=True)
    jobId = Column(Integer, ForeignKey("JobListing.jobId"), nullable=False)
    responsibility = Column(String, nullable=False)
    jobListing = relationship(
        "JobListingModel", back_populates="responsibilities", lazy="selectin"
    )

    def __repr__(self):
        return f"<Responsibility(id={self.id}, \
            jobId={self.jobId}, description=\
                '{self.description}')>"

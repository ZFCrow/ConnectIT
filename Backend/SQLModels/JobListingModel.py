from datetime import datetime
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import Boolean
from sqlalchemy.orm import relationship
from SQLModels.ResponsibilityModel import ResponsibilityModel  # noqa: F401
from SQLModels.CompanyModel import CompanyModel  # noqa: F401
from SQLModels.JobApplicationModel import JobApplicationModel  # noqa: F401
from Entity.JobListing import JobType, WorkArrangement
from .base import Base


def _values(enum_cls):
    """helper so we don’t repeat the lambda everywhere"""
    return [e.value for e in enum_cls]


class JobListingModel(Base):
    __tablename__ = "JobListing"

    jobId = Column(Integer, primary_key=True, autoincrement=True)
    companyId = Column(Integer, ForeignKey("Company.companyId"), nullable=False)
    fieldOfWorkId = Column(
        Integer, ForeignKey("FieldOfWork.fieldOfWorkId"), nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    applicationDeadline = Column(DateTime, nullable=False)
    experiencePreferred = Column(Integer, nullable=False)
    minSalary = Column(Integer, nullable=False)
    maxSalary = Column(Integer, nullable=False)

    jobType = Column(
        Enum(  # SQLAlchemy Enum column
            JobType,
            values_callable=_values,  # store enum.value, not enum.name
            native_enum=True,  # keep an actual MySQL ENUM
        ),
        nullable=False,
    )

    createdAt = Column(DateTime, nullable=False, default=datetime.now())
    workArrangement = Column(
        Enum(WorkArrangement, values_callable=_values, native_enum=True), nullable=False
    )
    isDeleted = Column(Boolean, nullable=False, default=False)

    # Foreign key to CompanyModel
    company = relationship("CompanyModel", lazy="selectin")
    fieldOfWork = relationship(
        "FieldOfWorkModel",
        back_populates="jobListing",
        lazy="selectin",
    )
    # Relationship to JobApplicationModel
    responsibilities = relationship(
        "ResponsibilityModel",
        back_populates="jobListing",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    jobApplication = relationship(
        "JobApplicationModel",
        back_populates="jobListing",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

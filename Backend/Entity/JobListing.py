from dataclasses import field, dataclass
from datetime import datetime
from typing import List, Optional
from Entity.Company import Company
from enum import Enum
from Entity.JobApplication import JobApplication


class WorkArrangement(Enum):
    Onsite = "Onsite"
    Remote = "Remote"
    Hybrid = "Hybrid"


class JobType(Enum):
    PartTime = "Part Time"
    FullTime = "Full Time"
    Internship = "Internship"
    Contract = "Contract"


@dataclass
class JobListing:
    # ――― Core fields (all private, single underscore) ――― #
    __jobId: int
    __title: str
    __description: str
    __applicationDeadline: datetime
    __minSalary: int
    __maxSalary: int
    __jobType: JobType
    __createdAt: datetime
    __workArrangement: WorkArrangement
    __fieldOfWork: str

    # ――― Optional / mutable collections ――― #
    __responsibilities: List[str] = field(default_factory=list)
    __experiencePreferred: int = 0
    __numApplicants: int = 0
    __isDeleted: bool = False
    __company: Optional[Company] = None
    __jobApplication: List[JobApplication] = field(default_factory=list)

    # ――― Read‑only property accessors ――― #
    @property
    def jobId(self) -> int:
        return self.__jobId

    @property
    def title(self) -> str:
        return self.__title

    @property
    def description(self) -> str:
        return self.__description

    @property
    def applicationDeadline(self) -> datetime:
        return self.__applicationDeadline

    @property
    def minSalary(self) -> int:
        return self.__minSalary

    @property
    def maxSalary(self) -> int:
        return self.__maxSalary

    @property
    def jobType(self) -> JobType:
        return self.__jobType

    @property
    def createdAt(self) -> datetime:
        return self.__createdAt

    @property
    def workArrangement(self) -> WorkArrangement:
        return self.__workArrangement

    @property
    def fieldOfWork(self) -> str:
        return self.__fieldOfWork

    @property
    def responsibilities(self) -> List[str]:
        return self.__responsibilities

    @property
    def experiencePreferred(self) -> int:
        return self.__experiencePreferred

    @property
    def numApplicants(self) -> int:
        return self.__numApplicants

    @property
    def isDeleted(self) -> bool:
        return self.__isDeleted

    @property
    def company(self) -> Optional[Company]:
        return self.__company

    @property
    def jobApplication(self) -> List[JobApplication]:
        return self.__jobApplication

    # ――― Convenience factories ――― #
    @classmethod
    def from_dict(cls, data: dict) -> "JobListing":
        """
        Create a JobListing instance from a plain dict,
        handling enum & date conversions.
        """

        # Parse enums (case‑insensitive, default values provided)
        job_type_str = (
            data.get("jobType") or data.get("job_type") or "Full Time"
        ).replace(" ", "")
        job_type = JobType[job_type_str]

        work_arr_str = (
            data.get("workArrangement") or data.get("work_arrangement") or "Onsite"
        ).replace(" ", "")
        work_arrangement = WorkArrangement[work_arr_str]

        # Parse dates (ISO 8601 expected when given as str)
        def _parse_dt(raw):
            return datetime.fromisoformat(raw) if isinstance(raw, str) else raw

        application_deadline = _parse_dt(
            data.get("applicationDeadline") or data.get("application_deadline")
        )
        created_at = _parse_dt(data.get("createdAt") or data.get("created_at"))

        # Build the instance
        return cls(
            _JobListing__jobId=data.get("jobId") or data.get("job_id"),
            _JobListing__title=data.get("title"),
            _JobListing__description=data.get("description"),
            _JobListing__applicationDeadline=application_deadline,
            _JobListing__minSalary=data.get("minSalary") or data.get("min_salary"),
            _JobListing__maxSalary=data.get("maxSalary") or data.get("max_salary"),
            _JobListing__jobType=job_type,
            _JobListing__createdAt=created_at,
            _JobListing__workArrangement=work_arrangement,
            _JobListing__fieldOfWork=data.get("fieldOfWork")
            or data.get("field_of_work")
            or "Other",
            _JobListing__responsibilities=data.get("responsibilities", []),
            _JobListing__isDeleted=data.get("isDeleted")
            or data.get("is_deleted", False),
            _JobListing__company=data.get("company"),
            _JobListing__experiencePreferred=data.get("experiencePreferred")
            or data.get("experience_preferred", 0),
            _JobListing__numApplicants=data.get("numApplicants")
            or data.get("num_applicants", 0),
            _JobListing__jobApplication=data.get("jobApplication")
            or data.get("job_application")
            or [],
        )

    def to_dict(self) -> dict:
        """
        Serialise to JSON‑serialisable dict suitable for REST responses or storage.
        """
        return {
            "jobId": self.jobId,
            "title": self.title,
            "description": self.description,
            "applicationDeadline": self.applicationDeadline.isoformat(),
            "minSalary": self.minSalary,
            "maxSalary": self.maxSalary,
            "jobType": self.jobType.value,
            "createdAt": self.createdAt.isoformat(),
            "workArrangement": self.workArrangement.value,
            "fieldOfWork": self.fieldOfWork,
            "responsibilities": list(self.responsibilities),
            "isDeleted": self.isDeleted,
            "company": self.company.to_dict() if self.company else None,
            "experiencePreferred": self.experiencePreferred,
            "numApplicants": self.numApplicants,
            "jobApplication": [app.to_dict() for app in self.jobApplication],
        }

    @classmethod
    def from_JobListingModel(cls, orm_obj, *, numApplicants: int = 0) -> "JobListing":
        from Entity.Company import Company  # local import avoids circulars

        return cls(
            _JobListing__jobId=orm_obj.jobId,
            _JobListing__title=orm_obj.title,
            _JobListing__description=orm_obj.description,
            _JobListing__applicationDeadline=orm_obj.applicationDeadline,
            _JobListing__minSalary=orm_obj.minSalary,
            _JobListing__maxSalary=orm_obj.maxSalary,
            _JobListing__jobType=orm_obj.jobType,
            _JobListing__createdAt=orm_obj.createdAt,
            _JobListing__workArrangement=orm_obj.workArrangement,
            _JobListing__fieldOfWork=getattr(
                orm_obj.fieldOfWork, "description", orm_obj.fieldOfWork
            ),
            _JobListing__responsibilities=[
                r.responsibility for r in orm_obj.responsibilities if r.responsibility
            ],
            _JobListing__isDeleted=orm_obj.isDeleted,
            _JobListing__company=(
                Company.from_CompanyModel(orm_obj.company) if orm_obj.company else None
            ),
            _JobListing__experiencePreferred=orm_obj.experiencePreferred or 0,
            _JobListing__numApplicants=numApplicants,
            _JobListing__jobApplication=(
                [JobApplication.from_model(a) for a in orm_obj.jobApplication]
                if orm_obj.jobApplication
                else []
            ),
        )

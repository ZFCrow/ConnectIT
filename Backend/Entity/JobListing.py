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
    _jobId: int
    _title: str
    _description: str
    _applicationDeadline: datetime
    _minSalary: int
    _maxSalary: int
    _jobType: JobType
    _createdAt: datetime
    _workArrangement: WorkArrangement
    _fieldOfWork: str

    # ――― Optional / mutable collections ――― #
    _responsibilities: List[str] = field(default_factory=list)
    _experiencePreferred: int = 0
    _numApplicants: int = 0
    _isDeleted: bool = False
    _company: Optional[Company] = None
    _jobApplication: List[JobApplication] = field(default_factory=list)

    # ――― Read‑only property accessors ――― #
    @property
    def jobId(self) -> int:
        return self._jobId

    @property
    def title(self) -> str:
        return self._title

    @property
    def description(self) -> str:
        return self._description

    @property
    def applicationDeadline(self) -> datetime:
        return self._applicationDeadline

    @property
    def minSalary(self) -> int:
        return self._minSalary

    @property
    def maxSalary(self) -> int:
        return self._maxSalary

    @property
    def jobType(self) -> JobType:
        return self._jobType

    @property
    def createdAt(self) -> datetime:
        return self._createdAt

    @property
    def workArrangement(self) -> WorkArrangement:
        return self._workArrangement

    @property
    def fieldOfWork(self) -> str:
        return self._fieldOfWork

    @property
    def responsibilities(self) -> List[str]:
        return self._responsibilities

    @property
    def experiencePreferred(self) -> int:
        return self._experiencePreferred

    @property
    def numApplicants(self) -> int:
        return self._numApplicants

    @property
    def isDeleted(self) -> bool:
        return self._isDeleted

    @property
    def company(self) -> Optional[Company]:
        return self._company

    @property
    def jobApplication(self) -> List[JobApplication]:
        return self._jobApplication

    # ――― Convenience factories ――― #
    @classmethod
    def from_dict(cls, data: dict) -> "JobListing":
        """
        Create a JobListing instance from a plain dict, 
        handling enum & date conversions.
        """

        # Parse enums (case‑insensitive, default values provided)
        job_type_str = (data.get("jobType")
                        or data.get("job_type")
                        or "Full Time").replace(" ", "")
        job_type = JobType[job_type_str]

        work_arr_str = (data.get("workArrangement")
                        or data.get("work_arrangement")
                        or "Onsite").replace(" ", "")
        work_arrangement = WorkArrangement[work_arr_str]

        # Parse dates (ISO 8601 expected when given as str)
        def _parse_dt(raw):
            return datetime.fromisoformat(raw) if isinstance(raw, str) else raw

        application_deadline = _parse_dt(data.get("applicationDeadline")
                                         or data.get("application_deadline"))
        created_at = _parse_dt(data.get("createdAt") or data.get("created_at"))

        # Build the instance
        return cls(
            _jobId=data.get("jobId") or data.get("job_id"),
            _title=data.get("title"),
            _description=data.get("description"),
            _applicationDeadline=application_deadline,
            _minSalary=data.get("minSalary") or data.get("min_salary"),
            _maxSalary=data.get("maxSalary") or data.get("max_salary"),
            _jobType=job_type,
            _createdAt=created_at,
            _workArrangement=work_arrangement,
            _fieldOfWork=data.get("fieldOfWork")
            or data.get("field_of_work")
            or "Other",
            _responsibilities=data.get("responsibilities", []),
            _isDeleted=data.get("isDeleted") or data.get("is_deleted", False),
            _company=data.get("company"),
            _experiencePreferred=data.get("experiencePreferred")
            or data.get("experience_preferred", 0),
            _numApplicants=data.get("numApplicants") or data.get("num_applicants", 0),
            _jobApplication=data.get("jobApplication")
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
            _jobId=orm_obj.jobId,
            _title=orm_obj.title,
            _description=orm_obj.description,
            _applicationDeadline=orm_obj.applicationDeadline,
            _minSalary=orm_obj.minSalary,
            _maxSalary=orm_obj.maxSalary,
            _jobType=orm_obj.jobType,           
            _createdAt=orm_obj.createdAt,
            _workArrangement=orm_obj.workArrangement,
            _fieldOfWork=getattr(orm_obj.fieldOfWork, "description",
                                 orm_obj.fieldOfWork),
            _responsibilities=[r.responsibility
                               for r in orm_obj.responsibilities
                               if r.responsibility],
            _isDeleted=orm_obj.isDeleted,
            _company=Company.from_CompanyModel(orm_obj.company)
            if orm_obj.company else None,
            _experiencePreferred=orm_obj.experiencePreferred or 0,
            _numApplicants=numApplicants,
            _jobApplication=[
                JobApplication.from_model(a)
                for a in orm_obj.jobApplication] if orm_obj.jobApplication else [],
        )

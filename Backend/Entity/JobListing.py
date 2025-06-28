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
    Intership = "Internship"
    Contract = "Contract"


class JobListing:
    def __init__(
        self,
        jobId: int,
        title: str,
        description: str,
        applicationDeadline: datetime,
        minSalary: int,
        maxSalary: int,
        jobType: JobType,
        createdAt: datetime,
        workArrangement: WorkArrangement,
        fieldOfWork: str,
        responsibilities: List[str],
        experiencePreferred: int = 0,
        numApplicants: int = 0,
        isDeleted: bool = False,
        company: Optional[Company] = None,
        jobApplication: Optional[List[JobApplication]] = None,
    ):
        self.jobId = jobId
        self.company = company
        self.title = title
        self.description = description
        self.applicationDeadline = applicationDeadline
        self.minSalary = minSalary
        self.maxSalary = maxSalary
        self.jobType = jobType
        self.createdAt = createdAt
        self.workArrangement = workArrangement
        self.fieldOfWork = fieldOfWork
        self.isDeleted = isDeleted
        self.numApplicants = numApplicants
        self.experiencePreferred = experiencePreferred
        self.responsibilities = responsibilities
        self.jobApplication = (
            jobApplication if jobApplication is not None else []
        )

    # Getters & Setters
    def getJobId(self) -> int:
        return self.jobId

    def setJobId(self, jobId: int) -> None:
        self.jobId = jobId

    def getCompanyId(self) -> int:
        return self.companyId

    def setCompanyId(self, companyId: int) -> None:
        self.companyId = companyId

    def getTitle(self) -> str:
        return self.title

    def setTitle(self, title: str) -> None:
        self.title = title

    def getDescription(self) -> str:
        return self.description

    def setDescription(self, desc: str) -> None:
        self.description = desc

    def getDeadline(self) -> datetime:
        return self.applicationDeadline

    def setDeadline(self, deadline: datetime) -> None:
        self.applicationDeadline = deadline

    def getMinSalary(self) -> int:
        return self.minSalary

    def setMinSalary(self, min_: int) -> None:
        self.minSalary = min_

    def getMaxSalary(self) -> int:
        return self.maxSalary

    def setMaxSalary(self, max_: int) -> None:
        self.maxSalary = max_

    def getType(self) -> str:  # Could be enum
        return self.jobType

    def setType(self, jobType: str) -> None:
        self.jobType = jobType

    def getCreatedAt(self) -> datetime:
        return self.createdAt

    def setCreatedAt(self, createdAt: datetime) -> None:
        self.createdAt = createdAt

    def getArrangement(self) -> str:  # WorkArrangement
        return str(self.workArrangement)

    def setArrangement(self, arrangement: WorkArrangement) -> None:
        self.workArrangement = arrangement

    # def getFieldOfWork(self) -> Field:
    #     return self.fieldOfWork

    # def setFieldOfWork(self, field: Field) -> None:
    #     self.fieldOfWork = field

    def getScope(self) -> str:
        return self.jobScope

    def setScope(self, scope: str) -> None:
        self.jobScope = scope

    def getResponsibilities(self) -> str:
        return self.responsibilities

    def setResponsibilities(self, resp: str) -> None:
        self.responsibilities = resp

    def getJobApplication(self) -> List[JobApplication]:
        return self.jobApplication

    def addJobApplication(self, userID: int) -> None:
        self.jobApplication.append(JobApplication(userID))

    @classmethod
    def from_dict(cls, data: dict):
        """
        Create a JobListing instance from a dictionary,
        handling Enums and Optionals.
        """
        # Parse enums from string (case-insensitive, forgiving)
        job_type_value = (
            data.get('jobType')
            or
            data.get('job_type')
            or
            'Full Time'
        )
        job_type = JobType(job_type_value)

        work_arrangement_value = (
            data.get('workArrangement')
            or
            data.get('work_arrangement')
            or
            'Onsite'
        )
        work_arrangement = WorkArrangement(work_arrangement_value)

        # Parse datetimes (expecting ISO strings)
        deadline = (
            data.get('applicationDeadline')
            or
            data.get('application_deadline')
            )
        created_at = data.get('createdAt') or data.get('created_at')
        application_deadline = (
            datetime.fromisoformat(deadline)
            if isinstance(deadline, str) else deadline
        )
        created_at = (
            datetime.fromisoformat(created_at)
            if isinstance(created_at, str) else created_at
        )

        return cls(
            jobId=data.get('jobId') or data.get('job_id'),
            title=data.get('title'),
            description=data.get('description'),
            applicationDeadline=application_deadline,
            minSalary=data.get('minSalary') or data.get('min_salary'),
            maxSalary=data.get('maxSalary') or data.get('max_salary'),
            jobType=JobType(job_type),
            createdAt=created_at,
            workArrangement=WorkArrangement(work_arrangement),
            fieldOfWork=(
                data.get('fieldOfWork')
                or
                data.get('field_of_work')
                or
                'Other'
                ),
            responsibilities=data.get('responsibilities', []),
            isDeleted=data.get('isDeleted') or data.get('is_deleted', False),
            company=data.get('company'),
            jobApplication=(
                data.get('jobApplication')
                or
                data.get('job_application')
                ),
            experiencePreferred=(
                data.get('experiencePreferred')
                or
                data.get('experience_preferred', 0)
                ),
            numApplicants=(
                data.get('numApplicants')
                or
                data.get('num_applicants', 0)
                ),
        )

    def to_dict(self) -> dict:
        return {
            "jobId":            self.jobId,
            "title":            self.title,
            "description":      self.description,
            "applicationDeadline": self.applicationDeadline.isoformat(),
            "minSalary":        self.minSalary,
            "maxSalary":        self.maxSalary,
            "jobType":          self.jobType.value,          # Enum → str
            "createdAt":        self.createdAt.isoformat(),
            "workArrangement":  self.workArrangement.value,
            "fieldOfWork":      self.fieldOfWork,
            "responsibilities": list(self.responsibilities),
            "isDeleted":        self.isDeleted,
            "company": (
                self.company.to_dict() if self.company else None
            ),
            "experiencePreferred": self.experiencePreferred,
            "numApplicants": self.numApplicants,
            "jobApplication": [
                app.to_dict() for app in self.jobApplication
            ] if self.jobApplication else [],

        }

    @classmethod
    def from_JobListingModel(cls, orm_obj, numApplicants=0) -> "JobListing":
        return cls(
            jobId=orm_obj.jobId,
            title=orm_obj.title,
            description=orm_obj.description,
            applicationDeadline=orm_obj.applicationDeadline,
            minSalary=orm_obj.minSalary,
            maxSalary=orm_obj.maxSalary,
            jobType=orm_obj.jobType,
            createdAt=orm_obj.createdAt,
            # Enum
            workArrangement=orm_obj.workArrangement,
            fieldOfWork=orm_obj.fieldOfWork.description,
            responsibilities=[
                r.responsibility for r in orm_obj.responsibilities
                if r.responsibility is not None
                ],
            isDeleted=orm_obj.isDeleted,
            company=Company.from_model(orm_obj.company),
            jobApplication=[
                JobApplication.from_model(a) for a in orm_obj.jobApplication
                ] if orm_obj.jobApplication else [],
            experiencePreferred=(
                orm_obj.experiencePreferred
                if orm_obj.experiencePreferred is not None else 0
                ),
            numApplicants=numApplicants
        )

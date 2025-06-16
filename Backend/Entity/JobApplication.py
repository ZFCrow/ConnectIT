from enum import Enum
from datetime import datetime

class Status(Enum):
    APPLIED = "Applied"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"

class JobApplication:
    def __init__(
        self,
        applicationId: int,
        jobId: int,
        userId: int,
        username: str,
        status: Status,
        appliedAt: datetime,
        resumeURL: str
    ):
        self.applicationId = applicationId
        self.jobId = jobId
        self.userId = userId
        self.username = username
        self.status = status
        self.appliedAt = appliedAt
        self.resumeURL = resumeURL

    def getApplicationId(self) -> int:
        return self.applicationId

    def setApplicationId(self, id: int) -> None:
        self.applicationId = id

    def getJobId(self) -> int:
        return self.jobId

    def setJobId(self, id: int) -> None:
        self.jobId = id

    def getUserId(self) -> int:
        return self.userId

    def setUserId(self, id: int) -> None:
        self.userId = id

    def getStatus(self) -> Status:
        return self.status

    def setStatus(self, status: Status) -> None:
        self.status = status

    def getAppliedAt(self) -> datetime:
        return self.appliedAt

    def setAppliedAt(self, applied: datetime) -> None:
        self.appliedAt = applied

    def getResumeURL(self) -> str:
        return self.resumeURL

    def setResumeURL(self, url: str) -> None:
        self.resumeURL = url

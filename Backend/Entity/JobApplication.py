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
        name: str,
        email: str,
        bio: str,
        status: Status,
        appliedAt: datetime,
        resumeURL: str,
        profilePicUrl: str = None,
        accountId: int = None
    ):
        self.applicationId = applicationId
        self.jobId = jobId
        self.userId = userId
        self.email = email
        self.bio = bio
        self.name = name
        self.status = status
        self.appliedAt = appliedAt
        self.resumeURL = resumeURL
        self.profilePicUrl = profilePicUrl  # Optional, for user profile picture
        self.accountId = accountId  # Optional, for user account ID

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
    def getProfilePicUrl(self) -> str:
        return self.profilePicUrl
    def setProfilePicUrl(self, url: str) -> None:
        self.profilePicUrl = url
    def getAccountId(self) -> int:
        return self.accountId
    def setAccountId(self, id: int) -> None:
        self.accountId = id
    def from_dict(cls, raw: dict) -> 'JobApplication':
        """
        Converts a dictionary to a JobApplication object.
        :param raw: Dictionary containing job application data.
        :return: JobApplication object.
        """
        return cls(
            applicationId=raw["applicationId"],
            jobId=raw["jobId"],
            userId=raw["userId"],
            name=raw["name"],
            email=raw["email"],
            bio=raw["bio"],
            status=Status(raw["status"]),
            appliedAt=raw["appliedAt"],
            resumeURL=raw["resumeURL"],
            profilePicUrl=raw.get("profilePicUrl", None),  # Optional
            accountId=raw.get("accountId", None)  # Optional
        )
    
    def to_dict(self) -> dict:
        """
        Converts the JobApplication object to a dictionary.
        :return: Dictionary representation of the JobApplication.
        """
        return {
            "applicationId": self.applicationId,
            "jobId": self.jobId,
            "userId": self.userId,
            "name": self.name,
            "email": self.email,
            "bio": self.bio,
            "status": self.status.value,  # Convert Enum to string
            "appliedAt": self.appliedAt.isoformat(),  # Convert datetime to ISO string
            "resumeURL": self.resumeURL,
            "profilePicUrl": self.profilePicUrl,  # Optional
            "accountId": self.accountId  # Optional
        }
    
    @classmethod
    def from_model(cls, model) -> 'JobApplication':
        """
        Converts a SQLAlchemy model to a JobApplication object.
        :param model: SQLAlchemy model instance.
        :return: JobApplication object.
        """
        return cls(
            applicationId=model.applicationId,
            jobId=model.jobId,
            userId=model.userId,
            name=model.user.account.name,
            email=model.user.account.email,
            bio=model.user.bio,
            status=model.status,
            appliedAt=model.appliedAt,
            resumeURL=model.resumeURL,
            accountId     = (model.user.account.accountId
                    if model.user and model.user.account else None),
            profilePicUrl = (model.user.account.profilePicUrl
                            if model.user and model.user.account else None),
        )
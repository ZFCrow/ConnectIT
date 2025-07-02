from dataclasses import dataclass
from enum import Enum
from datetime import datetime
from typing import Optional


class Status(Enum):
    APPLIED = "Applied"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


@dataclass
class JobApplication:
    _applicationId: int
    _jobId: int
    _userId: int
    _name: str
    _email: str
    _bio: str
    _status: Status
    _appliedAt: datetime
    _resumeURL: str
    _profilePicUrl: Optional[str] = None
    _accountId: Optional[int] = None

    # Properties (read-only)
    @property
    def applicationId(self) -> int:  # noqa: N802 (keeping camelCase for API compatibility)
        return self._applicationId

    @property
    def jobId(self) -> int:
        return self._jobId

    @property
    def userId(self) -> int:
        return self._userId

    @property
    def name(self) -> str:
        return self._name

    @property
    def email(self) -> str:
        return self._email

    @property
    def bio(self) -> str:
        return self._bio

    @property
    def status(self) -> Status:
        return self._status

    @property
    def appliedAt(self) -> datetime:
        return self._appliedAt

    @property
    def resumeURL(self) -> str:
        return self._resumeURL

    @property
    def profilePicUrl(self) -> Optional[str]:
        return self._profilePicUrl

    @property
    def accountId(self) -> Optional[int]:
        return self._accountId

    # ――― Serialisation helpers ――― #
    @classmethod
    def from_dict(cls, raw: dict) -> "JobApplication":
        """Create from a raw dict (e.g. JSON payload)."""
        return cls(
            _applicationId=raw["applicationId"],
            _jobId=raw["jobId"],
            _userId=raw["userId"],
            _name=raw["name"],
            _email=raw["email"],
            _bio=raw["bio"],
            _status=Status(raw["status"]),
            _appliedAt=raw["appliedAt"]
            if isinstance(raw["appliedAt"], datetime)
            else datetime.fromisoformat(raw["appliedAt"]),
            _resumeURL=raw["resumeURL"],
            _profilePicUrl=raw.get("profilePicUrl"),
            _accountId=raw.get("accountId"),
        )

    def to_dict(self) -> dict:
        """Serialise to a JSON-ready dict."""
        return {
            "applicationId": self.applicationId,
            "jobId": self.jobId,
            "userId": self.userId,
            "name": self.name,
            "email": self.email,
            "bio": self.bio,
            "status": self.status.value,
            "appliedAt": self.appliedAt.isoformat(),
            "resumeURL": self.resumeURL,
            "profilePicUrl": self.profilePicUrl,
            "accountId": self.accountId,
        }

    @classmethod
    def from_model(cls, model) -> "JobApplication":
        """Adapter from ORM/SQLAlchemy model to domain class."""
        return cls(
            _applicationId=model.applicationId,
            _jobId=model.jobId,
            _userId=model.userId,
            _name=model.user.account.name,
            _email=model.user.account.email,
            _bio=model.user.bio,
            _status=model.status,
            _appliedAt=model.appliedAt,
            _resumeURL=model.resumeURL,
            _accountId=(model.user.account.accountId if model.user and model.user.account else None),
            _profilePicUrl=(model.user.account.profilePicUrl if model.user and model.user.account else None),
        )

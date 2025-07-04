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
    __applicationId: int
    __jobId: int
    __userId: int
    __name: str
    __email: str
    __bio: str
    __status: Status
    __appliedAt: datetime
    __resumeURL: str
    __profilePicUrl: Optional[str] = None
    __accountId: Optional[int] = None

    # Properties (read-only)
    @property
    def applicationId(self) -> int:  # noqa: N802
        return self.__applicationId

    @property
    def jobId(self) -> int:
        return self.__jobId

    @property
    def userId(self) -> int:
        return self.__userId

    @property
    def name(self) -> str:
        return self.__name

    @property
    def email(self) -> str:
        return self.__email

    @property
    def bio(self) -> str:
        return self.__bio

    @property
    def status(self) -> Status:
        return self.__status

    @property
    def appliedAt(self) -> datetime:
        return self.__appliedAt

    @property
    def resumeURL(self) -> str:
        return self.__resumeURL

    @property
    def profilePicUrl(self) -> Optional[str]:
        return self.__profilePicUrl

    @property
    def accountId(self) -> Optional[int]:
        return self.__accountId

    # ――― Serialisation helpers ――― #
    @classmethod
    def from_dict(cls, raw: dict) -> "JobApplication":
        """Create from a raw dict (e.g. JSON payload)."""
        return cls(
            _JobApplication__applicationId=raw["applicationId"],
            _JobApplication__jobId=raw["jobId"],
            _JobApplication__userId=raw["userId"],
            _JobApplication__name=raw["name"],
            _JobApplication__email=raw["email"],
            _JobApplication__bio=raw["bio"],
            _JobApplication__status=Status(raw["status"]),
            _JobApplication__appliedAt=raw["appliedAt"]
            if isinstance(raw["appliedAt"], datetime)
            else datetime.fromisoformat(raw["appliedAt"]),
            _JobApplication__resumeURL=raw["resumeURL"],
            _JobApplication__profilePicUrl=raw.get("profilePicUrl"),
            _JobApplication__accountId=raw.get("accountId"),
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
            _JobApplication__applicationId=model.applicationId,
            _JobApplication__jobId=model.jobId,
            _JobApplication__userId=model.userId,
            _JobApplication__name=model.user.account.name,
            _JobApplication__email=model.user.account.email,
            _JobApplication__bio=model.user.bio,
            _JobApplication__status=model.status,
            _JobApplication__appliedAt=model.appliedAt,
            _JobApplication__resumeURL=model.resumeURL,
            _JobApplication__accountId=(model.user.account.accountId
                                        if model.user and model.user.account else None),
            _JobApplication__profilePicUrl=(model.user.account.profilePicUrl
                                            if model.user
                                            and
                                            model.user.account else None),
        )

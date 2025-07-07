from dataclasses import dataclass
from typing import Dict, Any, Optional


@dataclass
class Account:
    __accountId: int
    __name: str
    __email: str
    __passwordHash: str
    __role: str  # plain string – DB enum already cast to str
    __isDisabled: bool = False
    __twoFaEnabled: bool = False
    __profilePicUrl: Optional[str] = None
    __twoFaSecret: Optional[str] = None
    __sessionId: Optional[str] = None

    # ----------------- Properties ----------------- #
    @property
    def accountId(self) -> int:
        return self.__accountId

    @accountId.setter
    def accountId(self, value: int):
        self.__accountId = value

    def setAccountId(self, value: int):
        self.__accountId = value

    @property
    def name(self) -> str:
        return self.__name

    @property
    def email(self) -> str:
        return self.__email

    @property
    def passwordHash(self) -> str:
        return self.__passwordHash

    @property
    def role(self) -> str:
        return self.__role

    @property
    def isDisabled(self) -> bool:
        return self.__isDisabled

    @property
    def twoFaEnabled(self) -> bool:
        return self.__twoFaEnabled

    @property
    def profilePicUrl(self) -> Optional[str]:
        return self.__profilePicUrl

    @property
    def twoFaSecret(self) -> Optional[str]:
        return self.__twoFaSecret

    @property
    def sessionId(self) -> Optional[str]:
        return self.__sessionId

    # ----------------- Serialisation helpers ----------------- #
    def to_dict(self) -> dict:
        return {
            "accountId": self.accountId,
            "name": self.name,
            "email": self.email,
            "passwordHash": self.passwordHash,
            "profilePicUrl": self.profilePicUrl,
            "role": self.role,
            "isDisabled": self.isDisabled,
            "twoFaEnabled": self.twoFaEnabled,
            "twoFaSecret": self.twoFaSecret,
            "sessionId": self.sessionId,
        }

    @classmethod
    def from_AccountModel(cls, m):
        return cls(
            _Account__accountId=m.accountId,
            _Account__name=m.name,
            _Account__email=m.email,
            _Account__passwordHash=m.passwordHash,
            _Account__role=getattr(m, "role", ""),
            _Account__isDisabled=bool(getattr(m, "isDisabled", 0)),
            _Account__twoFaEnabled=bool(getattr(m, "twoFaEnabled", 0)),
            _Account__profilePicUrl=m.profilePicUrl or None,
            _Account__twoFaSecret=m.twoFaSecret or None,
            _Account__sessionId=getattr(m, "sessionId", None),
        )

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            _Account__accountId=data.get("accountId", 0),
            _Account__name=data.get("name", ""),
            _Account__email=data.get("email", ""),
            _Account__passwordHash=data.get("passwordHash", ""),
            _Account__role=data.get("role", "User"),
            _Account__isDisabled=bool(data.get("isDisabled", False)),
            _Account__twoFaEnabled=bool(data.get("twoFaEnabled", False)),
            _Account__profilePicUrl=data.get("profilePicUrl"),
            _Account__twoFaSecret=data.get("twoFaSecret"),
            _Account__sessionId=data.get("sessionId"),
        )

    def to_constructor_dict(self) -> Dict[str, Any]:
        return {
            "_Account__accountId": self.accountId,
            "_Account__name": self.name,
            "_Account__email": self.email,
            "_Account__passwordHash": self.passwordHash,
            "_Account__role": self.role,
            "_Account__isDisabled": self.isDisabled,
            "_Account__twoFaEnabled": self.twoFaEnabled,
            "_Account__profilePicUrl": self.profilePicUrl,
            "_Account__twoFaSecret": self.twoFaSecret,
            "_Account__sessionId": self.sessionId,
        }

from dataclasses import dataclass, field
from SQLModels import AccountModel
from typing import Dict, Any, Optional


@dataclass
class Account:
    __accountId: int
    __name: str
    __email: str
    __passwordHash: str
    __role: str
    __isDisabled: bool = False
    __twoFaEnabled: bool = False
    __profilePicUrl: Optional[str] = None
    __twoFaSecret: Optional[str] = None
    __sessionId: Optional[str] = None

    @property
    def accountId(self) -> int:
        return self.__accountId
    
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
    def profilePicUrl(self) -> str:
        return self.__profilePicUrl
    
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
    def twoFaSecret(self) -> str:
        return self.__twoFaSecret
    
    @property
    def sessionId(self) -> str:
        return self.__sessionId
    
    def setAccountId(self, id: int) -> None:
        self.__accountId = id

    def setTwoFa(self, enabled: bool, secret: str) -> None:
        self.__twoFaEnabled = enabled
        self.__twoFaSecret = secret

    def setAccountInfo(
            self, name: Optional[str] = None,
            passwordHash: Optional[str] = None,
            profilePicUrl: Optional[str] = None) -> None:
        if name is not None:
            self.__name = name
        if passwordHash is not None:
            self.__passwordHash = passwordHash
        if profilePicUrl is not None:
            self.__profilePicUrl = profilePicUrl
    
    @classmethod
    def from_AccountModel(cls, m: AccountModel) -> "Account":
        return cls(
            m.accountId,
            m.name,
            m.email,
            m.passwordHash,
            m.role,
            m.isDisabled,
            m.twoFaEnabled,
            m.profilePicUrl if m.profilePicUrl else None,
            m.twoFaSecret if m.twoFaSecret else None,
            getattr(m, "sessionId", None)
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "accountId": self.__accountId,
            "name": self.__name,
            "email": self.__email,
            "passwordHash": self.__passwordHash,
            "profilePicUrl": self.__profilePicUrl,
            "role": self.__role,
            "isDisabled": self.__isDisabled,
            "twoFaEnabled": self.__twoFaEnabled,
            "twoFaSecret": self.__twoFaSecret,
            "sessionId": self.__sessionId
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Account":
        return cls(
            data.get("accountId", 0),
            data.get("name", ""),
            data.get("email", ""),
            data.get("passwordHash", ""),
            data.get("role", ""),
            data.get("isDisabled", False),
            data.get("twoFaEnabled", False),
            data.get("profilePicUrl", ""),
            data.get("twoFaSecret", ""),
            data.get("sessionId", "")
        )
    
    def to_constructor_dict(self) -> Dict[str, Any]:
        return {
            "accountId": self.accountId,
            "name": self.name,
            "email": self.email,
            "passwordHash": self.passwordHash,
            "role": self.role,
            "isDisabled": self.isDisabled,
            "twoFaEnabled": self.twoFaEnabled,
            "profilePicUrl": self.profilePicUrl,
            "twoFaSecret": self.twoFaSecret,
            "sessionId": self.sessionId
        }
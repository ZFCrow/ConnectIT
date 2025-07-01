from dataclasses import dataclass, field
from Entity.Account import Account
from SQLModels.UserModel import UserModel
from typing import Optional


@dataclass
class User(Account):
    __userId: int
    __bio: Optional[str] = None
    __portfolioUrl: Optional[str] = None

    @property
    def userId(self):
        return self.__userId
    
    @property
    def bio(self):
        return self.__bio
    
    @property
    def portfolioUrl(self):
        return self.__portfolioUrl

    def setAccountInfo(
        self,
        name: Optional[str] = None,
        passwordHash: Optional[str] = None,
        profilePicUrl: Optional[str] = None,
        bio: Optional[str] = None,
        portfolioUrl: Optional[str] = None
    ) -> None:
        super().setAccountInfo(name, passwordHash, profilePicUrl)

        if bio is not None:
            self.__bio = bio
        if portfolioUrl is not None:
            self.__portfolioUrl = portfolioUrl

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        base = Account.from_dict(data)
        return cls(
            **base.to_constructor_dict(),
            userId=data.get("userId", 0),
            bio=data.get("bio", ""),
            portfolioUrl=data.get("portfolioUrl", "")
        )

    @classmethod
    def from_UserModel(cls, m: UserModel) -> "User":
        acc = m.account
        return cls(
            acc.accountId,
            acc.name,
            acc.email,
            acc.passwordHash,
            acc.profilePicUrl,
            acc.role,
            acc.isDisabled,
            acc.twoFaEnabled,
            acc.twoFaSecret,
            acc.sessionId,
            m.userId,
            m.bio,
            m.portfolioUrl
        )

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "userId": self.__userId,
            "bio": self.__bio,
            "portfolioUrl": self.__portfolioUrl
        })
        return base

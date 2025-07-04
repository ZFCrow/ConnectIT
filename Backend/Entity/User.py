from dataclasses import dataclass
from Entity.Account import Account
from typing import Optional
from SQLModels.UserModel import UserModel


@dataclass
class User(Account):
    __userId: int = None
    __bio: Optional[str] = None
    __portfolioUrl: Optional[str] = None

    # Properties
    @property
    def userId(self) -> int: return self._userId
    @property
    def bio(self) -> Optional[str]: return self._bio
    @property
    def portfolioUrl(self) -> Optional[str]: return self._portfolioUrl

    # Serialisation
    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update({
            "userId": self.userId,
            "bio": self.bio,
            "portfolioUrl": self.portfolioUrl,
        })
        return base

    @classmethod
    def from_dict(cls, data: dict):
        acc = Account.from_dict(data)
        return cls(
            **acc.to_constructor_dict(),
            __userId=data.get("userId", 0),
            __bio=data.get("bio"),
            __portfolioUrl=data.get("portfolioUrl"),
        )

    @classmethod
    def from_UserModel(cls, model: UserModel):
        acc = model.account
        return cls(
            _Account__accountId=acc.accountId,
            _Account__name=acc.name,
            _Account__email=acc.email,
            _Account__passwordHash=acc.passwordHash,
            _Account__role=acc.role.value,
            _Account__isDisabled=bool(acc.isDisabled),
            _Account__twoFaEnabled=bool(acc.twoFaEnabled),
            _Account__profilePicUrl=acc.profilePicUrl or None,
            _Account__twoFaSecret=acc.twoFaSecret or None,
            _Account__sessionId=getattr(acc, "sessionId", None),
            _User__userId=model.userId,
            _User__bio=model.bio or None,
            _User__portfolioUrl=model.portfolioUrl or None,
        )

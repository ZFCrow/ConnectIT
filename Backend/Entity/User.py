from dataclasses import dataclass
from Entity.Account import Account
from typing import Optional


from SQLModels.UserModel import UserModel

@dataclass
class User(Account):
    _userId: int = None
    _bio: Optional[str] = None
    _portfolioUrl: Optional[str] = None

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
            _userId       = data.get("userId", 0),
            _bio          = data.get("bio"),
            _portfolioUrl = data.get("portfolioUrl"),
        )

    @classmethod
    def from_UserModel(cls, model: UserModel):
        acc = model.account
        return cls(
            _accountId    = acc.accountId,
            _name         = acc.name,
            _email        = acc.email,
            _passwordHash = acc.passwordHash,
            _role         = acc.role.value,
            _isDisabled   = bool(acc.isDisabled),
            _twoFaEnabled = bool(acc.twoFaEnabled),
            _profilePicUrl= acc.profilePicUrl or None,
            _twoFaSecret  = acc.twoFaSecret or None,
            _sessionId    = getattr(acc, "sessionId", None),
            _userId       = model.userId,
            _bio          = model.bio or None,
            _portfolioUrl = model.portfolioUrl or None,
        )
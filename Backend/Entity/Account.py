from dataclasses import dataclass, field
from enum import Enum
from SQLModels import AccountModel
from typing import Dict, Any, Optional


@dataclass
class Account:
    _accountId: int
    _name: str
    _email: str
    _passwordHash: str
    _role: str  # plain string – DB enum already cast to str
    _isDisabled: bool = False
    _twoFaEnabled: bool = False
    _profilePicUrl: Optional[str] = None
    _twoFaSecret: Optional[str] = None
    _sessionId: Optional[str] = None

    # ----------------- Properties ----------------- #
    @property
    def accountId(self) -> int: return self._accountId
    @property
    def name(self) -> str: return self._name
    @property
    def email(self) -> str: return self._email
    @property
    def passwordHash(self) -> str: return self._passwordHash
    @property
    def role(self) -> str: return self._role
    @property
    def isDisabled(self) -> bool: return self._isDisabled
    @property
    def twoFaEnabled(self) -> bool: return self._twoFaEnabled
    @property
    def profilePicUrl(self) -> Optional[str]: return self._profilePicUrl
    @property
    def twoFaSecret(self) -> Optional[str]: return self._twoFaSecret
    @property
    def sessionId(self) -> Optional[str]: return self._sessionId

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
            _accountId      = m.accountId,
            _name           = m.name,
            _email          = m.email,
            _passwordHash   = m.passwordHash,
            _role           = getattr(m, "role", ""),
            _isDisabled     = bool(getattr(m, "isDisabled", 0)),
            _twoFaEnabled   = bool(getattr(m, "twoFaEnabled", 0)),
            _profilePicUrl  = m.profilePicUrl or None,
            _twoFaSecret    = m.twoFaSecret   or None,
            _sessionId      = getattr(m, "sessionId", None),
        )

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            _accountId    = data.get("accountId", 0),
            _name         = data.get("name", ""),
            _email        = data.get("email", ""),
            _passwordHash = data.get("passwordHash", ""),
            _role         = data.get("role", "User"),
            _isDisabled   = bool(data.get("isDisabled", False)),
            _twoFaEnabled = bool(data.get("twoFaEnabled", False)),
            _profilePicUrl= data.get("profilePicUrl"),
            _twoFaSecret  = data.get("twoFaSecret"),
            _sessionId    = data.get("sessionId"),
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
            "sessionId": self.sessionId,
        }
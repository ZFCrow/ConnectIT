from dataclasses import dataclass, field
from Entity.Account import Account
from dataclasses import asdict
from enum import Enum
from typing import Optional
from SQLModels.CompanyModel import CompanyModel  # local import to avoid tool ordering issues

@dataclass
class Company(Account):
    _companyId: int = None
    _companyDocUrl: str = None
    _verified: bool = False
    _description: Optional[str] = None
    _location: Optional[str] = None

    # Properties
    @property
    def companyId(self) -> int: return self._companyId
    @property
    def companyDocUrl(self) -> Optional[str]: return self._companyDocUrl
    @property
    def verified(self) -> bool: return self._verified
    @property
    def description(self) -> Optional[str]: return self._description
    @property
    def location(self) -> Optional[str]: return self._location

    # Serialisation
    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update({
            "companyId": self.companyId,
            "companyDocUrl": self.companyDocUrl,
            "verified": self.verified,
            "description": self.description,
            "location": self.location,
        })
        return base

    @classmethod
    def from_dict(cls, data: dict):
        acc = Account.from_dict(data)
        return cls(
            **acc.to_constructor_dict(),
            _companyId     = data.get("companyId", 0),
            _companyDocUrl = data.get("companyDocUrl"),
            _verified      = bool(data.get("verified", False)),
            _description   = data.get("description"),
            _location      = data.get("location"),
        )

    @classmethod
    def from_CompanyModel(cls, model: CompanyModel):
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
            _companyId    = model.companyId,
            _companyDocUrl= model.companyDocUrl or None,
            _verified     = bool(model.verified),
            _description  = model.description or None,
            _location     = model.location or None,
        )

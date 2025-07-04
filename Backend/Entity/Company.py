from dataclasses import dataclass
from Entity.Account import Account
from typing import Optional
from SQLModels.CompanyModel import CompanyModel


@dataclass
class Company(Account):
    __companyId: int = None
    __companyDocUrl: str = None
    __verified: int = 0
    __description: Optional[str] = None
    __location: Optional[str] = None

    # Properties
    @property
    def companyId(self) -> int: return self.__companyId
    @property
    def companyDocUrl(self) -> Optional[str]: return self.__companyDocUrl
    @property
    def verified(self) -> int: return self.__verified
    @property
    def description(self) -> Optional[str]: return self.__description
    @property
    def location(self) -> Optional[str]: return self.__location

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
            _Company__companyId=data.get("companyId", 0),
            _Company__companyDocUrl=data.get("companyDocUrl"),
            _Company__verified=data.get("verified", 0),
            _Company__description=data.get("description"),
            _Company__location=data.get("location"),
        )

    @classmethod
    def from_CompanyModel(cls, model: CompanyModel):
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

            _Company__companyId=model.companyId,
            _Company__companyDocUrl=model.companyDocUrl or None,
            _Company__verified=model.verified,
            _Company__description=model.description or None,
            _Company__location=model.location or None,
        )

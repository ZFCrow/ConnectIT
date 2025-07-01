from dataclasses import dataclass, field
from Entity.Account import Account
from dataclasses import asdict
from enum import Enum
from typing import Optional
from SQLModels.CompanyModel import CompanyModel


@dataclass
class Company(Account):
    __companyId: int
    __companyDocUrl: str
    __verified: int = 0
    __description: Optional[str] = None
    __location: Optional[str] = None

    @property
    def companyId(self) -> int:
        return self.__companyId
    
    @property
    def description(self) -> Optional[str]:
        return self.__description
    
    @property
    def location(self) -> Optional[str]:
        return self.__location
    
    @property
    def companyDocUrl(self):
        return self.__companyDocUrl
    
    @property
    def verified(self):
        return self.__verified

    def setAccountInfo(
        self,
        name: Optional[str] = None,
        passwordHash: Optional[str] = None,
        profilePicUrl: Optional[str] = None,
        description: Optional[str] = None,
        location: Optional[str] = None
    ) -> None:
        # Call the base Account method
        super().setAccountInfo(name, passwordHash, profilePicUrl)

        # Set Company-specific fields
        if description is not None:
            self.__description = description
        if location is not None:
            self.__location = location

    @classmethod
    def from_dict(cls, data):
        base = Account.from_dict(data)
        return cls(
            **base.to_constructor_dict(),
            companyId=data.get("companyId", 0),
            companyDocUrl=data.get("companyDocUrl", ""),
            description=data.get("description", ""),
            location=data.get("location", ""),
            verified=data.get("verified", 0)
        )

    @classmethod
    def from_CompanyModel(cls, model: CompanyModel) -> "Company":
        acc = model.account  # This is the joined AccountModel
        return cls(
            model.companyId,
            model.companyDocUrl,
            model.description,
            model.location,
            model.verified,
            acc.accountId,
            acc.name,
            acc.email,
            acc.passwordHash,
            acc.profilePicUrl,
            acc.role,
            acc.isDisabled,
            acc.twoFaEnabled,
            acc.twoFaSecret,
            acc.sessionId
        )

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update({
            "companyId": self.companyId,
            "companyDocUrl": self.companyDocUrl,
            "description": self.description,
            "location": self.location,
            "verified": self.verified,
        })
        return base

    # def to_dict(self) -> dict:
    #     """
    #     Plain-Python,
    #     JSON-ready representation of Company (incl. Account fields).
    #     """
    #     raw = asdict(self)

    #     # Convert any Enum values (e.g. role) to their `.value`
    #     for key, val in raw.items():
    #         if isinstance(val, Enum):
    #             raw[key] = val.value

    #     return {
    #         "companyId": raw["companyId"],
    #         "accountId": raw["accountId"],
    #         "name": raw["name"],
    #         "email": raw["email"],
    #         "passwordHash": raw["passwordHash"],
    #         "profilePicUrl": raw["profilePicUrl"],
    #         "role": raw["role"],  # already value-str thanks to loop
    #         "isDisabled": raw["isDisabled"],
    #         "sessionId": raw["sessionId"],
    #         "description": raw["description"],
    #         "location": raw["location"],
    #         "companyDocUrl": raw["companyDocUrl"],
    #         "verified": raw["verified"],
    #     }

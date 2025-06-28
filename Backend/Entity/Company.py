from dataclasses import dataclass
from Entity.Account import Account
from dataclasses import asdict
from enum import Enum


@dataclass
class Company(Account):
    companyId: int
    description: str
    location: str
    companyDocUrl: str
    verified: int

    @classmethod
    def from_dict(cls, data):
        base = Account.from_dict(data)
        return cls(
            **vars(base),
            companyId=data.get("companyId", 0),
            description=data.get("description", ""),
            location=data.get("location", ""),
            companyDocUrl=data.get("companyDocUrl", ""),
            verified=data.get("verified", 0)
        )

    @classmethod
    def from_model(cls, model):
        return cls(
            companyId=model.companyId,
            accountId=model.accountId,
            name=model.account.name,
            email=model.account.email,
            passwordHash=model.account.passwordHash,
            profilePicUrl=model.account.profilePicUrl,
            role=model.account.role,
            isDisabled=model.account.isDisabled,
            twoFaEnabled=model.account.twoFaEnabled,
            twoFaSecret=model.account.twoFaSecret,
            description=model.description,
            location=model.location,
            companyDocUrl=model.companyDocUrl,
            verified=model.verified,
        )

    def to_dict(self) -> dict:
        """
        Plain-Python,
        JSON-ready representation of Company (incl. Account fields).
        """
        raw = asdict(self)

        # Convert any Enum values (e.g. role) to their `.value`
        for key, val in raw.items():
            if isinstance(val, Enum):
                raw[key] = val.value

        return {
            "companyId": raw["companyId"],
            "accountId": raw["accountId"],
            "name": raw["name"],
            "email": raw["email"],
            "passwordHash": raw["passwordHash"],
            "profilePicUrl": raw["profilePicUrl"],
            "role": raw["role"],  # already value-str thanks to loop
            "isDisabled": raw["isDisabled"],
            "description": raw["description"],
            "location": raw["location"],
            "companyDocUrl": raw["companyDocUrl"],
            "verified": raw["verified"],
        }

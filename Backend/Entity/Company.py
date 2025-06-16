from dataclasses import dataclass
from Entity.Account import Account
from dataclasses import asdict
from enum import Enum

@dataclass
class Company(Account):
    companyId: int
    description: str
    location: str
    verified: bool

    @classmethod
    def from_dict(cls, data):
        base = Account.from_dict(data)
        return cls(
            **vars(base),
            companyId=data.get('companyId', 0),
            description=data.get('description', ''),
            location=data.get('location', ''),
            verfied=data.get('verified', False)
        )
    

    @classmethod
    def from_model(cls, model):
        return cls(
            companyId=model.companyId,
            accountId=model.accountId,
            name=model.account.name,
            email=model.account.email,
            passwordHash=model.account.passwordHash,
            passwordSalt=model.account.passwordSalt,
            profilePicUrl=model.account.profilePicUrl,
            role=model.account.role,
            isDisabled=model.account.isDisabled,
            description=model.description,
            location=model.location,
            verified=model.verified
        )
    def to_dict(self) -> dict:
        """
        Plain-Python, JSON-ready representation of Company (incl. Account fields).
        """
        raw = asdict(self)

        # Convert any Enum values (e.g. role) to their `.value`
        for key, val in raw.items():
            if isinstance(val, Enum):
                raw[key] = val.value

        return {
            "companyId":     raw["companyId"],
            "accountId":     raw["accountId"],
            "name":          raw["name"],
            "email":         raw["email"],
            "passwordHash":  raw["passwordHash"],
            "passwordSalt":  raw["passwordSalt"],
            "profilePicUrl": raw["profilePicUrl"],
            "role":          raw["role"],        # already value-str thanks to loop
            "isDisabled":    raw["isDisabled"],
            "description":   raw["description"],
            "location":      raw["location"],
            "verified":      raw["verified"],
        }
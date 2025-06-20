from dataclasses import dataclass
from Entity.Account import Account

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
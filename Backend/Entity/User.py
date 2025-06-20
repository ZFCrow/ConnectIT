from dataclasses import dataclass
from Entity.Account import Account

@dataclass
class User(Account):
    userId: int
    bio: str
    portfolioUrl: str

    @classmethod
    def from_dict(cls, data: dict) -> 'User':
        base = Account.from_dict(data)
        return cls(
            **vars(base),
            userId=data.get('userId', 0),
            bio=data.get('bio', ''),
            portfolioUrl=data.get('portfolioUrl', '')
        )
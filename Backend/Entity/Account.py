from dataclasses import dataclass

@dataclass
class Account:
    accountId: int
    name: str
    email: str
    passwordHash: str
    profilePicUrl: str
    
    role: str
    isDisabled: bool

    @classmethod
    def from_dict(cls, data: dict) -> 'Account':
        return cls(
            accountId = data.get('accountId', 0),
            name=data.get('name', ''),
            email=data.get('email', ''),
            passwordHash=data.get('passwordHash', ''),
            profilePicUrl=data.get('profilePicUrl', ''),
            role = data.get('role', ''),
            isDisabled=data.get('isDisabled', False)
        )
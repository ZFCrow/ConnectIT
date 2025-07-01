# Backend/SQLModels/AccountModel.py
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from .base import Base
from .UserModel import UserModel  # noqa: F401
from .CompanyModel import CompanyModel  # noqa: F401
from SQLModels.PostLikesModel import PostLikesModel  # noqa: F401

import enum


class Role(enum.Enum):
    User = "User"
    Company = "Company"
    Admin = "Admin"


class AccountModel(Base):
    __tablename__ = "Account"

    # Just the primary key for FK reference
    accountId = Column(Integer, primary_key=True, autoincrement=True)
    profilePicUrl = Column(String(255), nullable=True)

    name = Column(String(45), nullable=False)
    email = Column(String(45), nullable=False)
    passwordHash = Column(String(128), nullable=False)
    profilePicUrl = Column(String(512), nullable=True)

    role = Column(Enum(Role), nullable=False)
    isDisabled = Column(Boolean, nullable=False, default=False)
    twoFaEnabled = Column(Boolean, nullable=True, default=False)
    twoFaSecret = Column(String(256), nullable=True)
    sessionId = Column(String(128), nullable=True)

    # Relationship back to posts (optional)
    posts = relationship("PostModel", back_populates="account")
    comments = relationship("CommentModel", back_populates="account")
    postLikes = relationship("PostLikesModel", back_populates="account")
    user = relationship("UserModel", back_populates="account", uselist=False)
    company = relationship("CompanyModel", back_populates="account", uselist=False)

    def to_dict(self):
        return {
            "accountId": self.accountId,  # Match the column name
            "name": self.name,
            "email": self.email,
            "passwordHash": self.passwordHash,
            "profilePicUrl": self.profilePicUrl,
            "role": self.role.value if hasattr(self.role, "value") else str(self.role),
            "isDisabled": self.isDisabled,
            "twoFaEnabled": self.twoFaEnabled,
            "twoFaSecret": self.twoFaSecret,
            "sessionId": self.sessionId
        }

    def __repr__(self):
        return f"<Account(accountID={self.accountID})>"

# Backend/SQLModels/UserModel.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class UserModel(Base):
    __tablename__ = "User"  # Or whatever your user table is called
    
    # Just the primary key for FK reference
    userId = Column(Integer, primary_key=True, autoincrement=True)
    # Or use 'id' if that's your user table primary key:
    # id = Column(Integer, primary_key=True, autoincrement=True)
    bio = Column(String(1024), nullable=True)
    portfolioUrl = Column(String(512), nullable=True)

    accountId = Column(Integer, ForeignKey("Account.accountId"), nullable=False, unique=True)
    
    # Add relationships as needed
    # comments = relationship("CommentModel", back_populates="user")
    account = relationship("AccountModel", back_populates="user")
    jobApplications = relationship(
        "JobApplicationModel",
        back_populates="user"
    )
  
    def to_dict(self):
        return {
            "userId": self.userId,
            "accountId": self.accountId,
            "bio": self.bio,
            "portfolioUrl": self.portfolioUrl
        }
    
    def __repr__(self):
        return f"<User(userID={self.userID})>"
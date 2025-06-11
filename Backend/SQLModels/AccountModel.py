# Backend/SQLModels/AccountModel.py
from sqlalchemy import Column, Integer
from sqlalchemy.orm import relationship
from .base import Base

class AccountModel(Base):
    __tablename__ = "Account"
    
    # Just the primary key for FK reference
    accountId = Column(Integer, primary_key=True, autoincrement=True)
    
    # Relationship back to posts (optional)
    posts = relationship("PostModel", back_populates="account")
    
    def to_dict(self):
        return {
            'accountId': self.accountId  # Match the column name
        }
    def __repr__(self):
        return f"<Account(accountID={self.accountID})>"
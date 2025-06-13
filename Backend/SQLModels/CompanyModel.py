# Backend/SQLModels/CompanyModel.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class CompanyModel(Base):
    __tablename__ = "Company" 
    
    # Just the primary key for FK reference
    companyId = Column(Integer, primary_key=True, autoincrement=True)
    # Or use 'id' if that's your user table primary key:
    # id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(1024), nullable=True)
    location = Column(String(255), nullable=True)
    verified = Column(Boolean, nullable=False, default=False)

    accountId = Column(Integer, ForeignKey("Account.accountId"), nullable=False, unique=True)
    
    # Add relationships as needed
    # comments = relationship("CommentModel", back_populates="user")
    # account = relationship("AccountModel", back_populates="company")

    def to_dict(self):
        return {
            "companyId": self.companyId,
            "accountId": self.accountId,
            "description": self.description,
            "location": self.location,
            "verified": self.verified
        }
    
    def __repr__(self):
        return f"<Company(companyId={self.companyID})>"
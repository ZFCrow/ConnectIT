# Backend/SQLModels/UserModel.py
from sqlalchemy import Column, Integer
from sqlalchemy.orm import relationship
from .base import Base

class UserModel(Base):
    __tablename__ = "User"  # Or whatever your user table is called
    
    # Just the primary key for FK reference
    userId = Column(Integer, primary_key=True, autoincrement=True)
    # Or use 'id' if that's your user table primary key:
    # id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Add relationships as needed
    # comments = relationship("CommentModel", back_populates="user")
    
    def __repr__(self):
        return f"<User(userID={self.userID})>"
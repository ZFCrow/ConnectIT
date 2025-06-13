# Backend/SQLModels/AccountModel.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base
from SQLModels.PostLikesModel import PostLikesModel 

class AccountModel(Base):
    __tablename__ = "Account"
    
    # Just the primary key for FK reference
    accountId = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Integer, nullable=False)  # Assuming username is an Integer, adjust as needed 
    profilePicUrl = Column(String(255), nullable=True)  # Assuming displayPicture is a String, adjust as needed
    
    # Relationship back to posts (optional)
    post = relationship("PostModel", back_populates="account")
    comments = relationship("CommentModel", back_populates="account")
    postLikes = relationship("PostLikesModel", back_populates="account") 
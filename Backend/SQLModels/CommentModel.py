from .base import Base 
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship 
from datetime import datetime 


class CommentModel(Base): 
    __tablename__ = "Comment" 

    #! Primary Key 
    commentId = Column(Integer, primary_key=True, autoincrement=True) 
    content = Column(String(1028), nullable=False)
    createdAt = Column(DateTime, nullable=False, default=datetime.utcnow) 
    accountId = Column(Integer, ForeignKey('Account.accountId'), nullable=False)
    postId = Column(Integer, ForeignKey('Post.postId'), nullable=False) 
    isDeleted = Column(Integer, default=0, nullable=False) 

    #! Relationships 
    account = relationship("AccountModel", back_populates="comments") 
    post = relationship("PostModel", back_populates="comments") 
    

    
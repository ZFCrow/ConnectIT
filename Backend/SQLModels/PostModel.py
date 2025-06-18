from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, and_
from sqlalchemy.orm import relationship 
from .base import Base 
from datetime import datetime 
from .CommentModel import CommentModel 


class PostModel(Base): 
    __tablename__ = "Post"

    # pri key 
    postId = Column(Integer, primary_key=True, autoincrement=True) 
    title = Column(String(255), nullable=False) 
    content = Column(String(1000), nullable=False)
    
    #timestamp 
    date = Column('date',DateTime, nullable=False,default=datetime.now)

    # foreign key to Account Table
    accountId = Column(Integer, ForeignKey('Account.accountId'), nullable=False)

    isDeleted = Column(Integer, default=0, nullable=False) 


    # Relationship
    account = relationship("AccountModel", back_populates="post")
    postLabels = relationship("PostLabelModel", back_populates="post") 

    comments = relationship("CommentModel",primaryjoin=and_(
        CommentModel.postId == postId,
        CommentModel.isDeleted == 0  # Only include non-deleted comments 
    ) ,back_populates="post")

    postLikes = relationship("PostLikesModel", back_populates="post") 
    postViolations = relationship("PostViolationModel", back_populates="post") 

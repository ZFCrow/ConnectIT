from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship 
from .base import Base 
from datetime import datetime 
from .AccountModel import AccountModel 

class PostModel(Base): 
    __tablename__ = "Post"

    # pri key 
    postID = Column(Integer, primary_key=True, autoincrement=True) 
    title = Column(String(255), nullable=False) 
    content = Column(String(1000), nullable=False)
    
    #timestamp 
    date = Column('date',DateTime, nullable=False,default=datetime.utcnow)

    # foreign key to Account Table
    accountId = Column(Integer, ForeignKey('Account.accountId'), nullable=False)

    isDeleted = Column(Integer, default=0, nullable=False) 


    # Relationship to Account
    account = relationship("AccountModel", back_populates="posts")
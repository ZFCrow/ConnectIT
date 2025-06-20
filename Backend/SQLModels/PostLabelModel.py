from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship 
from .base import Base 
from datetime import datetime
from SQLModels.LabelModel import LabelModel 


class PostLabelModel(Base): 
    __tablename__ = "PostLabel"

    # pri key 
    PostLabelId = Column(Integer, primary_key=True, autoincrement=True) 
    postId = Column(Integer, ForeignKey('Post.postId'), nullable=False) 
    labelId = Column(Integer, ForeignKey('Label.labelId'), nullable=False) 

    # rs 
    post = relationship("PostModel", back_populates="postLabels") 
    label = relationship("LabelModel", back_populates="postLabels")
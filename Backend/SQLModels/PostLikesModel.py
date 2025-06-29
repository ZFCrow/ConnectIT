from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime
from SQLModels.LabelModel import LabelModel  # noqa: F401


class PostLikesModel(Base):
    __tablename__ = "PostLikes"

    # pri key
    postLikesId = Column(Integer, primary_key=True, autoincrement=True)
    createdAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    accountId = Column(Integer, ForeignKey("Account.accountId"), nullable=False)
    postId = Column(Integer, ForeignKey("Post.postId"), nullable=False)

    # rs
    account = relationship("AccountModel", back_populates="postLikes")
    post = relationship("PostModel", back_populates="postLikes")

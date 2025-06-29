from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime
from .AccountModel import AccountModel  # noqa: F401


class PostViolationModel(Base):
    __tablename__ = "PostViolation"

    # primary key
    postViolationId = Column(Integer, primary_key=True, autoincrement=True)

    date = Column("date", DateTime, nullable=False, default=datetime.utcnow)

    # foreign key to Post Table
    postId = Column(Integer, ForeignKey("Post.postId"), nullable=False)

    # foreign key to Violation Table
    violationId = Column(Integer, ForeignKey("Violation.violationId"), nullable=False)

    # Relationships
    post = relationship("PostModel", back_populates="postViolations")
    violation = relationship("ViolationModel", back_populates="postViolations")

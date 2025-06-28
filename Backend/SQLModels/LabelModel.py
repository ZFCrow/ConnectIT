from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from .base import Base
import enum


class ColorEnum(enum.Enum):
    RED = "red"
    BLUE = "blue"
    GREEN = "green"
    GRAY = "gray"
    PURPLE = "purple"
    PINK = "pink"
    ORANGE = "orange"
    YELLOW = "yellow"
    LIME = "lime"


class LabelModel(Base):
    __tablename__ = "Label"

    # pri key
    labelId = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(45), nullable=False)
    color = Column(
        Enum(
            ColorEnum,
            native_enum=False,
            values_callable=lambda enum: [e.value for e in enum]
            ), nullable=False)

    # rs
    postLabels = relationship("PostLabelModel", back_populates="label")

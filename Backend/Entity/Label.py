from dataclasses import dataclass


@dataclass
class Label:
    labelId: int
    description: str
    color: str
    numberofUses: int = 0  # Optional, default to 0

    @classmethod
    def from_dict(cls, data: dict) -> "Label":
        return cls(
            labelId=data.get("labelId", 0),
            description=data.get("description", ""),
            color=data.get("color", ""),
        )

    def toDict(self) -> dict:
        return {
            "labelId": self.labelId,
            "name": self.description,
            "color": self.color,
            "numberofUses": self.numberofUses,
        }

    @classmethod
    def fromLabelModel(cls, label_model) -> "Label":
        return cls(
            labelId=label_model.labelId,
            description=label_model.description,
            color=label_model.color.value if label_model.color else "",
            numberofUses=len(label_model.postLabels) if label_model.postLabels else 0,
        )

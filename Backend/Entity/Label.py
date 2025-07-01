from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass
class Label:
    # Private, name-mangled fields
    __labelId: int
    __description: str
    __color: str
    __numberofUses: int = field(default=0)

    # ──────────── Public, read-only properties ────────────
    @property
    def labelId(self) -> int:
        return self.__labelId

    @property
    def description(self) -> str:
        return self.__description

    @property
    def color(self) -> str:
        return self.__color

    @property
    def numberofUses(self) -> int:
        return self.__numberofUses

    # ──────────── Internal mutation methods ────────────
    def bump_usage(self, count: int = 1) -> None:
        """Increment the usage counter by `count`."""
        self.__numberofUses += count

    def update_description(self, new_description: str) -> None:
        """Change the label’s description."""
        self.__description = new_description

    def update_color(self, new_color: str) -> None:
        """Change the label’s color."""
        self.__color = new_color

    # ──────────── Converters ────────────
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Label":
        return cls(
            data.get("labelId", 0),
            data.get("description", ""),
            data.get("color", ""),
            data.get("numberofUses", 0),
        )

    def toDict(self) -> Dict[str, Any]:
        return {
            "labelId": self.__labelId,
            "name": self.__description,
            "color": self.__color,
            "numberofUses": self.__numberofUses,
        }

    @classmethod
    def fromLabelModel(cls, label_model: Any) -> "Label":
        return cls(
            label_model.labelId,
            label_model.description,
            label_model.color.value if label_model.color else "",
            len(label_model.postLabels) if label_model.postLabels else 0,
        )

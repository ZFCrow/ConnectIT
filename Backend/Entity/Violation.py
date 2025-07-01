from dataclasses import dataclass, field
from typing import Dict, Any
from SQLModels.ViolationModel import ViolationModel


@dataclass
class Violation:
    # ─────────── Private, name-mangled fields ───────────
    __violationId: int
    __name: str

    # ─────────── Public, read-only properties ───────────
    @property
    def violationId(self) -> int:
        return self.__violationId

    @property
    def name(self) -> str:
        return self.__name

    # ─────────── Internal mutation methods ───────────
    def update_name(self, new_name: str) -> None:
        """Change the violation’s description/name."""
        self.__name = new_name

    # ─────────── Converters ───────────
    @classmethod
    def fromViolationModel(cls, m: ViolationModel) -> "Violation":
        """
        Create a Violation instance from a ViolationModel instance.
        """
        return cls(m.violationId, m.description)

    def toDict(self) -> Dict[str, Any]:
        """
        Convert the Violation instance to a dictionary.
        """
        return {"violationId": self.__violationId, "name": self.__name}

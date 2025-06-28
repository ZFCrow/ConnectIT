from dataclasses import dataclass
from typing import Dict, Any
from SQLModels.ViolationModel import ViolationModel


@dataclass
class Violation:
    """Entity representing a violation in the system. """

    violationId: int
    name: str

    @classmethod
    def fromViolationModel(
            cls,
            violation_model: ViolationModel
            ) -> 'Violation':
        """
        Create a Violation instance from a ViolationModel instance.
        """
        return cls(
            violationId=violation_model.violationId,
            name=violation_model.description
        )

    def toDict(self) -> Dict[str, Any]:
        """
        Convert the Violation instance to a dictionary.
        """
        return {
            "violationId": self.violationId,
            "name": self.name
        }

from Boundary.TableDataGateway.ViolationGateway import ViolationGateway 
from Entity.Violation import Violation 
class ViolationControl:
    def __init__(self):
        pass

    @staticmethod
    def retrieveAllViolations() -> list[Violation]:
        """
        Retrieve all violations from the database.
        """
        return ViolationGateway.getAllViolations() 
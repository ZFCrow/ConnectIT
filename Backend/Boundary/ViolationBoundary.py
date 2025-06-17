from Control.ViolationControl import ViolationControl 
from Entity.Violation import Violation 



class ViolationBoundary: 
    def __init__(self):
        pass 

    @staticmethod
    def handleRetrieveAllViolations() -> list[Violation]:
        """
        Handle the retrieval of all violations.
        """
        return ViolationControl.retrieveAllViolations() 
from SQLModels.base import db_context 
from Entity.Violation import Violation
from typing import Optional, List, Dict 
from sqlalchemy.orm import joinedload 
from SQLModels.ViolationModel import ViolationModel



class ViolationGateway: 
    """
    Gateway since it pulls all violations at once
    """

    violationsCache: Dict[int, Violation] = {} 

    @staticmethod 
    def getAllViolations() -> List[Violation]:
        """
        Find all violations from table
        """

        with db_context.session_scope() as session:
            violationModels = session.query(ViolationModel).options(
                joinedload(ViolationModel.postViolations) # Load associated post violations 
              ).all() 
            
            if violationModels: 
                ViolationGateway.violationsCache = {vm.violationId : Violation.fromViolationModel(vm) for vm in violationModels}  
                return list(ViolationGateway.violationsCache.values())
                
                    
            
    @staticmethod
    def getViolationById(violationId : int ) -> Optional[Violation]:
        """
        Find violation by id
        -> search in cache first, then db 
        """ 
        if violationId in ViolationGateway.violationsCache:
            return ViolationGateway.violationsCache[violationId]

        with db_context.session_scope() as session:
            violationModel = session.query(ViolationModel).filter(ViolationModel.violationId == violationId).first()
            if violationModel:
                violation = Violation.fromViolationModel(violationModel)
                ViolationGateway.violationsCache[violationId] = violation
                return violation
            else:
                return None 
            

    @staticmethod 
    def getViolationsByIds(violationIds: List[int]) -> List[Violation]: 
        """
        Find violations by a list of ids
        -> search in cache first, then db 
        """
        violations = []
        for violationId in violationIds:
            if violationId in ViolationGateway.violationsCache:
                violations.append(ViolationGateway.violationsCache[violationId])
            else:
                violation = ViolationGateway.getViolationById(violationId)
                if violation:
                    violations.append(violation)
        return violations 
    
    @staticmethod
    def getAllViolationOptions():
        """
        Get all violations, return as objects or strings
        :param returnMethod: "object" for Violation objects, "string" for violation names
        :return: List of violations
        """
        with db_context.session_scope() as session:
            violationModels: ViolationModel = session.query(ViolationModel).all()
            return [
                {"violationId": vm.violationId, "description": vm.description}
                for vm in violationModels
            ]
    

            
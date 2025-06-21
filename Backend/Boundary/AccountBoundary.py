from Control.AccountControl import AccountControl


class AccountBoundary:
    def __init__(self):
        pass

    @staticmethod
    def registerAccount(accountData: dict) -> bool:
        return AccountControl.createAccount(accountData)
    
    @staticmethod
    def loginAccount(accountData: dict):
        return AccountControl.authenticateAccount(accountData)
    
    @staticmethod
    def viewAccount(accountId: int):
        return AccountControl.getAccountById(accountId)

    @staticmethod
    def saveProfile(accountData: dict) -> bool:
        return AccountControl.updateAccount(accountData)
    
    @staticmethod
    def disableAccount(accountId: int, authData: dict):
        return AccountControl.disableAccount(accountId, authData)
    
    @staticmethod
    def getAllCompanies():
        return AccountControl.getAllCompanies()
    @staticmethod
    def setCompanyVerified(company_id: int, verified: int) :
        return AccountControl.setCompanyVerified(company_id=company_id, verified=verified)
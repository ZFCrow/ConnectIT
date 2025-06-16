from Control.AccountControl import AccountControl


class AccountBoundary:
    def __init__(self):
        pass

    @staticmethod
    def registerAccount(accountData: dict) -> bool:
        return AccountControl.createAccount(accountData)
    
    @staticmethod
    def viewAccount(accountId: int):
        return AccountControl.getAccountById(accountId)

    @staticmethod
    def saveProfile(accountData: dict) -> bool:
        return AccountControl.updateAccount(accountData)
    
    @staticmethod
    def disableAccount(accountId: int, authData: dict):
        return AccountControl.disableAccount(accountId, authData)
    
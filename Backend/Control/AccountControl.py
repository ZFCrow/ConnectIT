from Boundary.Mapper.AccountMapper import AccountMapper
from Entity.Account import Account


class AccountControl:
    def __init__(self):
        pass

    @staticmethod
    def createAccount(accountData: dict) -> bool:
        account = Account.from_dict(accountData)

        return AccountMapper.createAccount(account)
    
    @staticmethod
    def getAccountById(accountId: int) -> Account:
        return AccountMapper.getAccountById(accountId)
    
    @staticmethod
    def updateAccount(accountData: dict) -> bool:
        account = Account.from_dict(accountData)

        return AccountMapper.updateAccount(account)
    
    @staticmethod
    def disableAccount(accountId: int) -> bool:
        return AccountMapper.disableAccount(accountId)
    
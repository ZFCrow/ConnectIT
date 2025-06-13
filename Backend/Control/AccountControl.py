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
    
from Control.AccountControl import AccountControl


class ViewProfile:
    def __init__(self):
        pass

    @staticmethod
    def viewAccount(accountId: int):
        return AccountControl.getAccountById(accountId)
    
    
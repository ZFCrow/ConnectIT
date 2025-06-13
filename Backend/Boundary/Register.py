from Control.AccountControl import AccountControl


class Register:
    def __init__(self):
        pass

    @staticmethod
    def registerAccount(accountData: dict) -> bool:
        return AccountControl.createAccount(accountData)
    
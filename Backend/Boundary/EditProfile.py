from Control.AccountControl import AccountControl


class EditProfile:
    def __init__(self):
        pass

    @staticmethod
    def saveProfile(accountData: dict) -> bool:
        return AccountControl.updateAccount(accountData)

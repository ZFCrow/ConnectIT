import bcrypt


def hash_password(password: str) -> str:
    HashedPassword = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return HashedPassword.decode("utf-8")


def verify_hash_password(password: str, hashPassword: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"), hashPassword.encode("utf-8")
        )

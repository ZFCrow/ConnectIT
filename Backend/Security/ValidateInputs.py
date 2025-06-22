import re
import bleach

EMAIL_REGEX = re.compile(r"^[^@]+@[^@]+\.[^@]+$")
BLEACH_KWARGS = dict(tags=[], attributes={}, strip=True)

def required_fields(data: dict, fields: list[str]) -> list[str]:
    return [f for f in fields if f not in data or data[f] is None]

def sanitize_input(val: str) -> str:
    return bleach.clean(val, **BLEACH_KWARGS)

def sanitize_fields(data: dict, fields: list[str]) -> None:
    for f in fields:
        if f in data and isinstance(data[f], str):
            data[f] = sanitize_input(data[f])

def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email))

def validate_login(data: dict) -> dict:
    errors = {}
    missing = required_fields(data, ["email", "password"])
    if missing:
        errors["missing"] = f"Missing fields: {', '.join(missing)}"
        return errors
    
    sanitize_fields(data, ["email"])

    if not validate_email(data["email"]):
        errors["email"] = "Invalid email format"
    return errors

def validate_register(data: dict) -> dict:
    errors = {}
    missing = required_fields(data, ["name", "email", "password"])
    if missing:
        errors["missing"] = f"Missing fields: {', '.join(missing)}"
        return errors
    
    sanitize_fields(data, ["name", "email"])

    if not validate_email(data["email"]):
        errors["email"] = "Invalid email format"

    pwd = data.get("password", "")
    if len(pwd) < 8:
        errors["password"] = "Password must be at least 8 characters long"
    elif len(pwd) > 64:
        errors["password"] = "Password must not exceed 64 characters"
    # elif is_common_or_pwned_password(pwd):
    #     errors["password"] = "Password is too common or has been compromised"

    return errors


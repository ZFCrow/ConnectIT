import re
import bleach
import os

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

def load_bad_passwords() -> set:
    try:
        file_path = os.path.join(os.path.dirname(__file__), "10k-most-common.txt")
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return set(line.strip().lower() for line in f if line.strip())
    except FileNotFoundError:
        print("Warning: Blocklist file not found.")
        return set()

# Load once at app start (global)
BAD_PASSWORDS = load_bad_passwords()

def is_common_password(password: str) -> bool:
    return password.strip().lower() in BAD_PASSWORDS

def validate_register(data: dict) -> dict:
    errors = {}
    missing = required_fields(data, ["name", "email", "password"])
    if missing:
        errors["missing"] = f"Missing fields: {', '.join(missing)}"
        return errors
    
    sanitize_fields(data, ["name", "email"])

    if not validate_email(data["email"]):
        errors["email"] = "Invalid email format."

    pwd = data.get("password", "")
    if len(pwd) < 8:
        errors["password"] = "Password must be at least 8 characters long."
    elif len(pwd) > 64:
        errors["password"] = "Password must not exceed 64 characters."
    elif is_common_password(pwd):
        errors["password"] = "Password is too common."

    return errors

def validate_post(data: dict) -> dict:
    errors = {}
    missing = required_fields(data, ["title", "content"])
    if missing:
        errors["missing"] = f"Missing fields: {', '.join(missing)}"
        return errors
    
    sanitize_fields(data, ["title", "content"])
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if len(title) < 1:
        errors["title"] = "Title cannot be empty"
    elif len(title) > 100:
        errors["title"] = "Title must not exceed 100 characters"

    if len(content) < 1:
        errors["content"] = "Content cannot be empty"

    return errors

def validate_comment(data: dict) -> dict:
    errors = {}
    missing = required_fields(data, ["content"])
    if missing:
        errors["missing"] = f"Missing fields: {', '.join(missing)}"
        return errors
    
    sanitize_fields(data, ["content"])
    content = data.get("content", "").strip()

    if len(content) < 1:
        errors["content"] = "Content cannot be empty"
    elif len(content) > 500:
        errors["content"] = "Content must not exceed 500 characters"

    return errors
import re
import bleach
import os

EMAIL_REGEX = re.compile(r"^[^@]+@[^@]+\.[^@]+$")
BLEACH_KWARGS = dict(tags=[], attributes={}, strip=True)
ASCII_PRINTABLE = re.compile(r"^[\x20-\x7E]+$")


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

    pwd = data.get("password", "")
    if len(pwd) < 8:
        errors["password"] = "Password must be at least 8 characters long."  # nosec
    elif len(pwd) > 64:
        errors["password"] = "Password must not exceed 64 characters."  # nosec

    return errors


def load_bad_passwords() -> set:
    try:
        file_path = os.path.join(
            os.path.dirname(__file__), "xato-net-10-million-passwords-10000.txt"
        )
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
    if not ASCII_PRINTABLE.fullmatch(pwd):
        errors["password"] = (
            "Password must contain only " "printable ASCII characters."
        )  # nosec
    if len(pwd) < 8:
        errors["password"] = "Password must be at least 8 characters long."  # nosec
    elif len(pwd) > 64:
        errors["password"] = "Password must not exceed 64 characters."  # nosec
    elif is_common_password(pwd):
        errors["password"] = "Password is too common."  # nosec

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


def validate_job_listing(data: dict) -> dict:
    errors = {}
    missing = required_fields(
        data, ["title", "description", "minSalary", "maxSalary", "experiencePreferred"]
    )
    if missing:
        errors["missing"] = f"Missing fields: {', '.join(missing)}"
        return errors

    sanitize_fields(data, ["title", "description", "responsibilities"])
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    if len(title) < 1:
        errors["title"] = "Title cannot be empty"
    elif len(title) > 100:
        errors["title"] = "Title must not exceed 100 characters"

    if len(description) < 1:
        errors["description"] = "Description cannot be empty"
    elif len(description) > 1000:
        errors["description"] = "Description must not exceed 1000 characters"
    raw_reqs = data.get("responsibilities", [])
    if not isinstance(raw_reqs, list):
        errors["responsibilities"] = "Responsibilities must be a list"
    else:
        cleaned = []
        for idx, item in enumerate(raw_reqs):
            if not isinstance(item, str):
                errors[f"responsibilities[{idx}]"] = (
                    "Each responsibility \
                    must be a string"
                )
                continue
            text = sanitize_input(item).strip()
            if len(text) < 1:
                errors[f"responsibilities[{idx}]"] = (
                    "Each responsibility \
                    cannot be empty"
                )
            elif len(text) > 500:
                errors[f"responsibilities[{idx}]"] = (
                    "Each responsibility \
                    must not exceed 500 characters"
                )
            else:
                cleaned.append(text)

        data["responsibilities"] = cleaned

    try:
        min_salary = int(data.get("minSalary", 0))
        max_salary = int(data.get("maxSalary", 0))
        if (min_salary == 0 or max_salary == 0) or (
            min_salary is None or max_salary is None
        ):
            errors["salary"] = "Minimum and maximum salary must be greater than 0"
        elif min_salary < 0 or max_salary < 0:
            errors["salary"] = "Salaries must be non-negative"
        elif min_salary > max_salary:
            errors["salary"] = "Minimum salary cannot exceed maximum salary"
        elif (max_salary - min_salary) > 500:
            errors["salary"] = "Salary range must not exceed 500"

    except ValueError:
        errors["salary"] = "Invalid salary format"

    try:
        years_of_experience = int(data.get("experiencePreferred", 0))
        if years_of_experience > 45:
            errors["experience"] = "Years of experience cannot exceed 45"
        if years_of_experience < 0:
            errors["experience"] = "Years of experience must be non-negative"
    except ValueError:
        errors["experience"] = "Invalid years of experience format"

    return errors


def validate_profile(data: dict) -> dict:
    errors: dict[str, str] = {}
    sanitize_fields(data, ["bio", "name", "description", "location"])

    bio = data.get("bio", "").strip()
    name = data.get("name", "").strip()
    location = data.get("location", "").strip()
    description = data.get("description", "").strip()

    if len(bio) > 1000:
        errors["bio"] = "Bio must not exceed 1000 characters"

    if len(name) < 1:
        errors["name"] = "Name cannot be empty"
    elif len(name) > 40:
        errors["name"] = "Name must not exceed 40 characters"

    if len(location) > 250:
        errors["location"] = "Location must not exceed 250 characters"

    if len(description) > 1000:
        errors["description"] = "Description must not exceed 1000 characters"

    if data.get("newPassword") or data.get("confirmNew"):
        old = data.get("password", "").strip()
        new = data.get("newPassword", "")
        conf = data.get("confirmNew", "")
        if not old:
            errors["password"] = (
                "Current password is " "required to change password."
            )  # nosec
        elif new != conf:
            errors["confirmNew"] = "New password and confirmation do not match."
        else:
            if not ASCII_PRINTABLE.fullmatch(new):
                errors["newPassword"] = (
                    "Password must contain only " "printable ASCII characters."
                )
            elif len(new) < 8:
                errors["newPassword"] = "Password must be at least 8 characters long."
            elif len(new) > 64:
                errors["newPassword"] = "Password must not exceed 64 characters."
            elif is_common_password(new):
                errors["newPassword"] = "Password is too common."

    return errors

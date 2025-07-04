import pytest
from Backend.Security.ValidateInputs import (
    required_fields,
    sanitize_fields,
    sanitize_input,
    validate_email,
    validate_comment,
    validate_login,
    validate_register,
    validate_profile,
    validate_post,
    validate_job_listing
)


def test_required_fields_missing():
    data = {"name": "Alice"}
    required = ["name", "email", "password"]
    assert required_fields(data, required) == ["email", "password"]


def test_required_fields_none():
    data = {"email": None, "name": "Alice"}
    required = ["name", "email"]
    assert required_fields(data, required) == ["email"]


def test_required_fields_complete():
    data = {"name": "Alice", "email": "a@example.com", "password": "x"}
    required = ["name", "email", "password"]
    assert required_fields(data, required) == []


def test_sanitize_input_removes_html():
    dirty = "<script>alert('hack')</script>Hello"
    clean = sanitize_input(dirty)
    assert "<script>" not in clean
    assert "<" not in clean and ">" not in clean  # rough fallback
    assert "Hello" in clean


def test_sanitize_fields_mutates_in_place():
    data = {
        "name": "<b>Bob</b>",
        "bio": "<script>alert('x')</script>Safe"
    }
    sanitize_fields(data, ["name", "bio"])
    assert data["name"] == "Bob"
    assert "<script>" not in data['bio']
    assert "<" not in data['bio'] and ">" not in data['bio']  # rough fallback


def test_sanitize_fields_skips_non_strings():
    data = {"name": "<b>Bob</b>", "age": 30}
    sanitize_fields(data, ["name", "age"])
    assert data["name"] == "Bob"
    assert data["age"] == 30


@pytest.mark.parametrize("email,expected", [
    ("test@example.com", True),
    ("a@b.co", True),
    ("invalid@", False),
    ("@domain.com", False),
    ("missingdomain@", False),
    ("", False),
    ("plainaddress", False),
])
def test_validate_email(email, expected):
    assert validate_email(email) == expected


@pytest.mark.parametrize(
    "data,expected_keys",
    [
        ({}, ["missing"]),
        ({"email": "a@b.com"}, ["missing"]),
        ({"name": "John", "email": "a@b.com", "password": "short"}, ["password"]),
        ({"name": "John", "email": "a@b.com", "password": "x" * 65}, ["password"]),
        ({"name": "John", "email": "invalid-email", "password": "goodpass123"},
         ["email"]),
        ({"name": "John", "email": "a@b.com", "password": "goodpass123"}, []),
    ]
)
def test_validate_register(data, expected_keys, monkeypatch):
    monkeypatch.setattr("Backend.Security.ValidateInputs.is_common_password",
                        lambda x: False)
    result = validate_register(data)
    assert sorted(result.keys()) == sorted(expected_keys)


@pytest.mark.parametrize(
    "data,expected_keys",
    [
        # --- Missing fields ---
        ({}, ["missing"]),
        ({"email": "user@example.com"}, ["missing"]),
        ({"password": "secret123"}, ["missing"]),

        # --- Invalid email ---
        ({"email": "not-an-email", "password": "goodpass123"}, ["email"]),

        # --- Password length issues ---
        ({"email": "user@example.com", "password": "short"}, ["password"]),
        ({"email": "user@example.com", "password": "x" * 65}, ["password"]),

        # --- All valid ---
        ({"email": "user@example.com", "password": "goodpass123"}, []),
        ({"email": "  user@example.com  ", "password": "   goodpass123   "}, []),
    ],
)
def test_validate_login(data, expected_keys):
    result = validate_login(data)
    assert sorted(result.keys()) == sorted(expected_keys)


@pytest.mark.parametrize(
    "data,expected_keys",
    [
        # --- Missing fields ---
        ({}, ["missing"]),
        ({"title": "Hello"}, ["missing"]),
        ({"content": "World"}, ["missing"]),

        # --- Title length ---
        ({"title": "", "content": "Some content"}, ["title"]),
        ({"title": "x" * 101, "content": "Some content"}, ["title"]),
        ({"title": "Valid title", "content": ""}, ["content"]),

        # --- All valid ---
        ({"title": "Good Title", "content": "Valid content"}, []),
        ({"title": "  Trimmed Title  ", "content": "  Trimmed content  "}, []),
    ],
)
def test_validate_post(data, expected_keys):
    result = validate_post(data)
    assert sorted(result.keys()) == sorted(expected_keys)


@pytest.mark.parametrize(
    "data,expected_keys",
    [
        # --- Missing fields ---
        ({}, ["missing"]),

        # --- Content length ---
        ({"content": ""}, ["content"]),
        ({"content": "x" * 501}, ["content"]),

        # --- All valid ---
        ({"content": "Valid comment"}, []),
        ({"content": "  Trimmed comment  "}, []),
    ],
)
def test_validate_comment(data, expected_keys):
    result = validate_comment(data)
    assert sorted(result.keys()) == sorted(expected_keys)


@pytest.mark.parametrize(
    "data,expected_keys",
    [
        # --- Salary validation ---
        (
            {
                "title": "Title", "description": "Desc",
                "minSalary": -1, "maxSalary": 1000, "experiencePreferred": 0
            },
            ["salary"],
        ),
        (
            {
                "title": "Title", "description": "Desc",
                "minSalary": 1000, "maxSalary": -1, "experiencePreferred": 0
            },
            ["salary"],
        ),
        (
            {
                "title": "Title", "description": "Desc",
                "minSalary": 2000, "maxSalary": 1000, "experiencePreferred": 0
            },
            ["salary"],
        ),
        (
            {
                "title": "Title", "description": "Desc",
                "minSalary": "abc", "maxSalary": 1000, "experiencePreferred": 0
            },
            ["salary"],
        ),
        (
            {
                "title": "Title", "description": "Desc",
                "minSalary": 0, "maxSalary": 0, "experiencePreferred": 0
            },
            ["salary"],
        ),
        (
            {
                "title": "Title", "description": "Desc",
                "minSalary": 1000, "maxSalary": 1600, "experiencePreferred": 0
            },
            ["salary"],  # range is 600, which exceeds 500
        ),

        # --- Valid salary (should not return error) ---
        (
            {
                "title": "Title", "description": "Desc",
                "minSalary": 1000, "maxSalary": 1500, "experiencePreferred": 0
            },
            [],  # Valid range: 500
        ),
    ]
)
def test_validate_job_listing(data, expected_keys):
    result = validate_job_listing(data)
    assert sorted(result.keys()) == sorted(expected_keys)


@pytest.mark.parametrize(
    "data,expected_keys",
    [
        # --- Bio length ---
        ({"bio": "x" * 1001, "name": "Name", "location": "Loc", "description": "Desc"},
         ["bio"]),

        # --- Name empty or too long ---
        ({"bio": "", "name": "", "location": "Loc", "description": "Desc"}, ["name"]),
        ({"bio": "", "name": "x" * 41, "location": "Loc", "description": "Desc"},
         ["name"]),

        # --- Location too long ---
        ({"bio": "", "name": "Name", "location": "x" * 251, "description": "Desc"},
         ["location"]),

        # --- Description too long ---
        ({"bio": "", "name": "Name", "location": "Loc", "description": "x" * 1001},
         ["description"]),

        # --- All valid ---
        ({"bio": "Short bio", "name": "Valid Name", "location": "Somewhere",
         "description": "Desc"}, []),
    ],
)
def test_validate_profile(data, expected_keys):
    result = validate_profile(data)
    assert sorted(result.keys()) == sorted(expected_keys)

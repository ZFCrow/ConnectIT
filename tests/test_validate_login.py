import pytest
from Backend.Security.ValidateInputs import validate_login  # Adjust import if needed

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
        ({"email": "user@example.com", "password": "short"}, ["password"]),  # too short
        ({"email": "user@example.com", "password": "x" * 65}, ["password"]),  # too long

        # --- All valid ---
        ({"email": "user@example.com", "password": "goodpass123"}, []),
        ({"email": "  user@example.com  ", "password": "   goodpass123   "}, []),  # sanitized
    ],
)
def test_validate_login(data, expected_keys):
    result = validate_login(data)
    assert sorted(result.keys()) == sorted(expected_keys)

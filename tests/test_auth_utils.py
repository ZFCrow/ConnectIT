import pytest
from Backend.Security.AuthUtils import *

def test_hash_password_produces_different_output():
    password = "MySecurePassword123"
    hashed = hash_password(password)

    assert isinstance(hashed, str)
    assert hashed != password  # ensure it's actually hashed

def test_verify_hash_password_success():
    password = "MySecurePassword123"
    hashed = hash_password(password)

    assert verify_hash_password(password, hashed) is True

def test_verify_hash_password_failure():
    password = "CorrectPassword"
    wrong_password = "WrongPassword"
    hashed = hash_password(password)

    assert verify_hash_password(wrong_password, hashed) is False

from typing import cast

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.response import Response
from typing import cast


def check(password: str, expected_message: str):
    client = APIClient()
    url = reverse("api_user_register")
    payload = {
        "first_name": "firstname",
        "last_name": "lastname",
        "username": "username",
        "password": password,
    }
    response = cast(Response, client.post(url, payload, format="json"))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data == {"password": [expected_message]}


@pytest.mark.django_db
def test_password_empty_string():
    empty_string = ""
    assert len(empty_string) == 0
    check(empty_string, "This field may not be blank.")


@pytest.mark.django_db
def test_password_minimum_length():
    too_short_password = "Fail!11"
    assert len(too_short_password) == 7
    check(
        too_short_password,
        "This password is too short. It must contain at least 8 characters.",
    )


@pytest.mark.django_db
def test_password_maximum_length():
    too_long_password = "Aa1!" * 16 + "A"  # 4 * 16 = 64 + "A" = 65 characters
    assert len(too_long_password) == 65
    check(
        too_long_password,
        "This password is too long. It must not contain more than 64 characters.",
    )


@pytest.mark.django_db
def test_password_has_invalid_character():
    check(
        "ValidPass1!/",
        "Password contains invalid character(s): /. Allowed symbols: !@#$%^&*()_+-=[]{};:,.?~.",
    )


@pytest.mark.django_db
def test_password_has_space():
    check("Testspa ce1!", "Password must not contain spaces.")


@pytest.mark.django_db
def test_password_missing_lowercase_letter():
    check(
        "ONLY_UPPERCASE_LETTERS1!",
        "Password must contain at least one lowercase letter.",
    )


@pytest.mark.django_db
def test_password_missing_uppercase_letter():
    check(
        "only_lowercase_letters1!",
        "Password must contain at least one uppercase letter.",
    )


@pytest.mark.django_db
def test_password_missing_digit():
    check("Testdigit!", "Password must contain at least one digit.")


@pytest.mark.django_db
def test_password_missing_symbol():
    check(
        "Testsymbol1",
        "Password must contain at least one of: !@#$%^&*()_+-=[]{};:,.?~.",
    )


@pytest.mark.django_db
def test_password_too_common():
    check("Password1!", "This password is too common.")


@pytest.mark.django_db
def test_password_too_common():  # NEEDS FIXING add test for username too similar to username.
    check("Password1!", "This password is too common.")

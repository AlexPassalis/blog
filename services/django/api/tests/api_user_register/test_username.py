from api.tests.api_user_register.test_valid import UserRegisterResponseData

from typing import cast
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.response import Response
from typing import cast


def check(username: str, expected_message: str):
    client = APIClient()
    url = reverse("api_auth_register")
    payload = {
        "first_name": "firstname",
        "last_name": "lastname",
        "username": username,
        "password": "!1Password",
        "email": "user@example.com",
    }
    response = cast(Response, client.post(url, payload, format="json"))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data == {"username": [expected_message]}


@pytest.mark.django_db
def test_username_empty_string():
    empty_string = ""
    assert len(empty_string) == 0
    check(empty_string, "This field may not be blank.")


@pytest.mark.django_db
def test_username_minimum_length():
    too_short_password = "usern"
    assert len(too_short_password) == 5
    check(
        too_short_password,
        "This username is too short. It must contain at least 6 characters.",
    )


@pytest.mark.django_db
def test_username_maximum_length():
    too_long_username = "username" * 2 + "A"  # 8 * 2 = 16 + "A" = 17 characters
    assert len(too_long_username) == 17
    check(
        too_long_username,
        "This username is too long. It must not contain more than 16 characters.",
    )


@pytest.mark.django_db
def test_username_already_exists():
    client = APIClient()
    url = reverse("api_auth_register")
    payload = {
        "first_name": "firstname",
        "last_name": "lastname",
        "username": "username",
        "password": "!1Password",
        "email": "user@example.com",
    }

    first = cast(Response, client.post(url, payload, format="json"))
    assert first.status_code == status.HTTP_201_CREATED
    assert first.data is not None
    data = cast(UserRegisterResponseData, first.data)
    assert data["username"] == "username"
    assert isinstance(data.get("id"), int)

    second = cast(Response, client.post(url, payload, format="json"))
    assert second.status_code == status.HTTP_400_BAD_REQUEST
    assert second.data == {
        "username": ["A user with that username already exists."],
        "email": ["A user with this email already exists."],
    }

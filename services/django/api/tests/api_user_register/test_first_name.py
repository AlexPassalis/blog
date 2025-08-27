from typing import cast
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.response import Response
from typing import cast


def check(first_name: str, expected_message: str):
    client = APIClient()
    url = reverse("api_user_register")
    payload = {
        "first_name": first_name,
        "last_name": "lastname",
        "username": "username",
        "password": "!1Password",
    }
    response = cast(Response, client.post(url, payload, format="json"))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data == {"first_name": [expected_message]}


@pytest.mark.django_db
def test_empty_string():
    empty_string = ""
    assert len(empty_string) == 0
    check(empty_string, "This field may not be blank.")


@pytest.mark.django_db
def test_maximum_length():
    too_long_first_name = "Aa" * 16 + "A"  # 2 * 16 = 32 + "A" = 33 characters
    assert len(too_long_first_name) == 33
    check(
        too_long_first_name,
        "This first name is too long. It must not contain more than 32 characters.",
    )


@pytest.mark.django_db
def test_has_invalid_character():
    check(
        "firstname/",
        "First name may only contain letters.",
    )


@pytest.mark.django_db
def test_has_space():
    check("first name", "First name may only contain letters.")

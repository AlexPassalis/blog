from typing import TypedDict, cast

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.response import Response
from typing import cast


class UserRegisterResponseData(TypedDict):
    id: int
    username: str


@pytest.mark.django_db
def test_api_auth_register_valid_request():
    client = APIClient()
    url = reverse("api_auth_register")
    payload = {
        "first_name": "firstname",
        "last_name": "lastname",
        "username": "username",
        "password": "!1Password",
        "email": "user@example.com",
    }
    response = cast(Response, client.post(url, payload, format="json"))

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data is not None
    data = cast(UserRegisterResponseData, response.data)
    assert data["username"] == "username"
    assert isinstance(data.get("id"), int)

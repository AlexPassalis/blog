import pytest
from django.db import connections
from django.db.utils import OperationalError


@pytest.mark.django_db
def test_can_connect_to_database():
    db_conn = connections["default"]
    try:
        db_conn.ensure_connection()
        assert db_conn.is_usable()
    except OperationalError:
        pytest.fail("Testcontainers database is not available.")

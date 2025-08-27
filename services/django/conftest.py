import pytest
from testcontainers.postgres import PostgresContainer
from pytest_django.plugin import DjangoDbBlocker
from django.core.management import call_command
import os


@pytest.fixture(scope="session")
def postgres_container():
    container = PostgresContainer("postgres:17-alpine").with_bind_ports(5432, None)
    container.start()
    try:
        yield container
    finally:
        container.stop()


@pytest.fixture(scope="session")
def django_db_setup(
    postgres_container: PostgresContainer, django_db_blocker: DjangoDbBlocker
):
    with django_db_blocker.unblock():
        ALEXPASSALIS_POSTGRES_URL = postgres_container.get_connection_url(driver=None)
        os.environ["ALEXPASSALIS_POSTGRES_URL"] = (
            ALEXPASSALIS_POSTGRES_URL  # does not work NEEDS FIXING
        )
        call_command("makemigrations", "api", verbosity=0)
        call_command("migrate", "api", verbosity=0)


# Run test_can_connect_to_database as the first test.
def pytest_collection_modifyitems(items):
    for index, test in enumerate(items):
        if test.name == "test_can_connect_to_database":
            db_test = items.pop(index)
            items.insert(0, db_test)
            break

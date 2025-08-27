import os
import sys


def validate_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        print(f"Missing environment variable: {name}.", file=sys.stderr)
        sys.exit(1)
    return value


def read_secret(secret: str) -> str:
    secret_path = f"/run/secrets/{secret}"
    if not os.path.exists(secret_path):
        print(f"{secret} does not exist.", file=sys.stderr)
        sys.exit(1)

    with open(secret_path, "r", encoding="utf-8") as content:
        secret_string = content.read().strip()
    if not secret_string:
        print(f"{secret} is an empty string.", file=sys.stderr)
        sys.exit(1)

    return secret_string

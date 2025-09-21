from dotenv import load_dotenv
from main.data.env.utils import read_secret, validate_env
import sys

load_dotenv()

PYTHON_ENV = validate_env("PYTHON_ENV")
if PYTHON_ENV not in {"production", "testing", "development"}:
    print(f"Unknown PYTHON_ENV value: {PYTHON_ENV}.", file=sys.stderr)
    sys.exit(1)
IS_RUNTIME = PYTHON_ENV in {"production", "development"}

DJANGO_SECRET_KEY = (
    read_secret("BLOG_DJANGO_SECRET_KEY")
    if IS_RUNTIME
    else "qu94xvx#-x$x84b5_fq^a$y99qf#ox!3&l%w&^f4i4+!!j=5+0"
)
DJANGO_DEBUG = False if PYTHON_ENV == "production" else True
DJANGO_ALLOWED_HOSTS = validate_env("DJANGO_ALLOWED_HOSTS").split(",")
DJANGO_CORS_ALLOWED_ORIGINS = validate_env("DJANGO_CORS_ALLOWED_ORIGINS").split(",")
POSTGRES_URL = (
    read_secret("BLOG_POSTGRES_URL")
    if IS_RUNTIME
    else "postgresql://test:test@172.17.0.4:5432/test"  # NEEDS FIXING validate_env("_POSTGRES_URL")
)

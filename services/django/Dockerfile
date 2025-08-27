FROM python:3.13.5 AS base
WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements-dev.txt

COPY . .



FROM base AS dev
ENV PYTHON_ENV=development

# Prevents Python from writing pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

ENV PORT=8000

EXPOSE ${PORT}
CMD ["sh", "-c", "uvicorn main.asgi:application --host 0.0.0.0 --port ${PORT} --reload"]



FROM base AS test
ENV PYTHON_ENV=testing

CMD ["pytest", "--maxfail=1", "-vv", "-s", "--showlocals"]

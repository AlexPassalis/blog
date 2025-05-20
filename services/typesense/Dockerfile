FROM typesense/typesense:29.0.rc23 AS base
# Install curl for the healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

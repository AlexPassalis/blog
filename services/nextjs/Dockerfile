FROM node:20-alpine3.20 AS base
# Install curl for the healthcheck
RUN apk add --no-cache curl

FROM base AS deps
WORKDIR /app/deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate && pnpm i --frozen-lockfile



FROM deps AS dev
WORKDIR /app
COPY . . 
COPY --from=deps /app/deps/node_modules ./node_modules
RUN rm -rf /app/deps

ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

CMD ["pnpm", "run", "dev"]

FROM node:23-alpine AS base
# Install curl for the healthcheck
RUN apk add --no-cache curl



FROM base AS deps
WORKDIR /app/deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate && pnpm i --frozen-lockfile



FROM deps AS dev
WORKDIR /app
COPY . .
COPY --from=deps /app/deps/node_modules ./node_modules
RUN rm -rf /app/deps

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV PORT=3000
EXPOSE ${PORT}

CMD ["pnpm", "run", "dev"]

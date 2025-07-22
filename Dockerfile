FROM oven/bun:canary-alpine AS base

WORKDIR /app

COPY . .

RUN bun install

CMD ["bun", "server.ts"]

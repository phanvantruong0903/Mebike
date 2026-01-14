FROM docker.io/node:lts-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN NX_DAEMON=false npx nx run-many -t prisma:generate

RUN --mount=type=cache,target=/app/.nx/cache \
  NX_DAEMON=false NX_CACHE_DIRECTORY=/app/.nx/cache npx nx build incident-service --configuration=production

FROM docker.io/node:lts-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/apps/incident-service/dist ./
COPY apps/incident-service/prisma ./prisma
COPY apps/incident-service/src/saga ./src/saga
COPY common/src/lib/proto ./common/src/lib/proto
COPY --from=builder /app/common/src/lib/prisma ./common/src/lib/prisma

RUN npm install --omit=dev --legacy-peer-deps && npm install prisma@5.22.0

CMD ["sh", "-c", "npx prisma migrate deploy && node main.js"]

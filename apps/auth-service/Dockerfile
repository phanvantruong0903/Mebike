FROM docker.io/node:lts-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN NX_DAEMON=false npx nx run-many -t prisma:generate

RUN --mount=type=cache,target=/app/.nx/cache \
  NX_DAEMON=false NX_CACHE_DIRECTORY=/app/.nx/cache npx nx build auth-service --configuration=production

FROM docker.io/node:lts-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/apps/auth-service/dist ./
COPY apps/auth-service/prisma ./prisma
COPY apps/auth-service/src/saga ./src/saga
COPY common/src/lib/proto ./common/src/lib/proto
COPY --from=builder /app/common/src ./common/src

RUN npm install --omit=dev --legacy-peer-deps

CMD ["sh", "-c", "npx prisma@5.22.0 migrate deploy && node main.js"]

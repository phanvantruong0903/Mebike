FROM docker.io/node:lts-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN NX_DAEMON=false npx nx run-many -t prisma:generate

RUN --mount=type=cache,target=/app/.nx/cache \
  NX_DAEMON=false NX_CACHE_DIRECTORY=/app/.nx/cache npx nx build rental-service --configuration=production

FROM docker.io/node:lts-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/apps/rental-service/dist ./
COPY apps/rental-service/prisma ./prisma
COPY common/src/lib/proto ./common/src/lib/proto
COPY --from=builder /app/common/src/lib/prisma ./common/src/lib/prisma

RUN npm install --omit=dev --legacy-peer-deps

CMD ["sh", "-c", "npx prisma@5.22.0 migrate deploy && node main.js"]

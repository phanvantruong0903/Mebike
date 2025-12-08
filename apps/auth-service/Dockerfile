FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* nx.json tsconfig.base.json ./

COPY common ./common

RUN npm pkg delete scripts.postinstall

RUN npm ci --legacy-peer-deps

COPY . .

RUN node tools/scripts/generate-all-prisma.js

RUN npx nx run auth-service:prune --configuration=production

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/apps/auth-service/dist/package.json ./
COPY --from=builder /app/apps/auth-service/dist/package-lock.json ./
COPY --from=builder /app/apps/auth-service/dist/workspace_modules ./workspace_modules

RUN npm pkg delete scripts.postinstall && \
  npm install --omit=dev --legacy-peer-deps && \
  npm install \
  @nestjs/core@^11.1.6 @nestjs/common@^11.1.6 @nestjs/platform-express@^11.1.6 @nestjs/microservices@^11.1.6 @nestjs/config @nestjs/passport \
  @nestjs/graphql @nestjs/apollo graphql apollo-server-core \
  @grpc/grpc-js @grpc/proto-loader \
  class-validator class-transformer \
  consul axios bcrypt passport passport-jwt \
  rxjs reflect-metadata @nestjs/jwt dotenv prisma@5.22.0 \
  kafkajs@2.2.4 ioredis@5.8.2 \
  --legacy-peer-deps

COPY --from=builder /app/apps/auth-service/dist/main.js ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/common ./common
COPY --from=builder /app/common ./apps/auth-service/common
COPY --from=builder /app/common/src/lib/prisma/auth/generated/libquery_engine-linux-musl-openssl-3.0.x.so.node ./

COPY --from=builder /app/apps/auth-service/prisma ./apps/auth-service/prisma

EXPOSE 50051

WORKDIR /app/apps/auth-service
CMD ["sh", "-c", "npx prisma migrate deploy && node /app/main.js"]
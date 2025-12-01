FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* nx.json tsconfig.base.json ./

COPY common ./common

RUN npm pkg delete scripts.postinstall

COPY apps/auth-service/prisma ./apps/auth-service/prisma
COPY apps/user-service/prisma ./apps/user-service/prisma
COPY apps/inventory-service/prisma ./apps/inventory-service/prisma

RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate --schema=apps/auth-service/prisma/schema.prisma
RUN npx prisma generate --schema=apps/user-service/prisma/schema.prisma
RUN npx prisma generate --schema=apps/inventory-service/prisma/schema.prisma

RUN npx nx run api-gateway:prune --configuration=production

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl netcat-openbsd

ENV NODE_ENV=production 
ENV PORT=3000

COPY --from=builder /app/apps/api-gateway/dist/package.json ./
COPY --from=builder /app/apps/api-gateway/dist/package-lock.json ./
COPY --from=builder /app/apps/api-gateway/dist/workspace_modules ./workspace_modules

RUN npm pkg delete scripts.postinstall && \
  npm install --omit=dev --legacy-peer-deps && \
  npm install \
  @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/microservices @nestjs/config @nestjs/passport \
  @nestjs/graphql @nestjs/apollo graphql apollo-server-core \
  @grpc/grpc-js @grpc/proto-loader \
  class-validator class-transformer \
  consul axios bcrypt passport passport-jwt \
  rxjs reflect-metadata @nestjs/jwt dotenv \
  @apollo/server \
  --legacy-peer-deps

COPY --from=builder /app/apps/api-gateway/dist/main.js ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/common ./common
COPY --from=builder /app/common/src/lib/prisma/auth/generated/libquery_engine-linux-musl-openssl-3.0.x.so.node ./
COPY --from=builder /app/common/src/lib/prisma/user/generated/libquery_engine-linux-musl-openssl-3.0.x.so.node ./
COPY --from=builder /app/common/src/lib/prisma/inventory/generated/libquery_engine-linux-musl-openssl-3.0.x.so.node ./

EXPOSE 3000
CMD ["node","main.js"]
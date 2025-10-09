FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app/common
RUN npm install
WORKDIR /app
RUN npx nx build auth-service --prod

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/auth-service/dist ./dist
COPY package*.json ./
COPY common/package.json ./common/
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/common ./common

RUN npm pkg delete scripts.prepare && npm ci --omit=dev

WORKDIR /app/common
RUN npm install --omit=dev

WORKDIR /app
RUN npx prisma generate

ENV AUTH_SERVICE_PORT=50051

EXPOSE 50051

CMD ["node", "dist/main.js"]

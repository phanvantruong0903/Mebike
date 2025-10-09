FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN npm install

RUN npx nx build auth-service --prod

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/auth-service/dist ./dist
COPY package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm pkg delete scripts.prepare && npm ci --omit=dev

RUN npx prisma generate

ENV AUTH_SERVICE_PORT=50051

EXPOSE 50051

CMD ["node", "dist/main.js"]

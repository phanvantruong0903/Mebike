FROM node:20-alpine AS builder
WORKDIR /app

COPY . .
COPY common/package.json ./common/

RUN npm install

RUN npx nx build api-gateway --prod

RUN npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY package*.json ./
COPY common/package.json ./common/
COPY --from=builder /app/prisma ./prisma

RUN npm pkg delete scripts.prepare && npm install --omit=dev

RUN npx prisma generate

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000
RUN ["node","dist/main.js"]
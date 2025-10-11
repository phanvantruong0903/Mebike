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
COPY --from=builder /app/common ./common

RUN npm pkg delete scripts.prepare && npm install --omit=dev

WORKDIR /app/common
RUN npm install --omit=dev

WORKDIR /app

RUN npx prisma generate

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000
CMD ["node","dist/main.js"]
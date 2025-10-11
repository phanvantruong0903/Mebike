FROM node:20-alpine AS builder
WORKDIR /app

COPY ../../package*.json nx.json tsconfig.base.json ./

COPY . .

RUN npm install

RUN npx nx build common

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm ci --omit=dev

CMD ["node", "dist/main.js"]
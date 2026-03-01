FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies and build
COPY package.json package-lock.json* ./
COPY tsconfig.json vite.config.ts .
COPY script ./script
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY attached_assets ./attached_assets

RUN npm ci --omit=dev || npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built server + client artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000
CMD ["node", "dist/index.cjs"]

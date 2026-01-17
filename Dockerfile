# =========================
# Build stage
# =========================
FROM node:20-alpine AS build
WORKDIR /app

# Alpine dažnai neturi bash; jei build skriptas kviečia bash, gausi exit 127
RUN apk add --no-cache bash

COPY package*.json ./
# Build įrankiai dažniausiai yra devDependencies (vite/tsc/webpack/...)
RUN npm ci

COPY . .

# Paleidžiam build su aiškesniu output; jei kris, parodys kas "not found"
RUN /bin/sh -lc 'set -eux; npm run build || ( \
  echo "---- BUILD DEBUG ----"; \
  echo "node:"; node -v; \
  echo "npm:"; npm -v; \
  echo "scripts:"; node -e "console.log(require(\"./package.json\").scripts)"; \
  echo "bin tools:"; ls -la node_modules/.bin || true; \
  exit 1 )'

# =========================
# Production stage
# =========================
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.js"]

# =========================
# Build stage
# =========================
FROM node:20-alpine AS build
WORKDIR /app

# Dažnai prireikia bash (jei build scriptas jo reikalauja)
RUN apk add --no-cache bash

COPY package*.json ./
RUN npm ci

COPY . .

# Svarbiausia dalis: build output -> build.log, o jei krenta, atspausdinam build.log į Coolify logus
RUN /bin/sh -lc 'set -e; \
  npm run build > /tmp/build.log 2>&1 || ( \
    echo "----- npm run build FAILED -----"; \
    cat /tmp/build.log; \
    echo "----- node/npm versions -----"; \
    node -v; npm -v; \
    echo "----- scripts -----"; \
    node -e "console.log(require(\"./package.json\").scripts)"; \
    echo "----- node_modules/.bin -----"; \
    ls -la node_modules/.bin || true; \
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

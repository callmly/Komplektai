# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# 1) Install deps (incl. dev deps for build tools)
COPY package*.json ./
RUN npm ci

# 2) Copy source and build
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built output from build stage
COPY --from=build /app/dist ./dist

# If you need other runtime files, copy them too (example):
# COPY --from=build /app/public ./public

EXPOSE 5000
CMD ["node", "dist/index.js"]

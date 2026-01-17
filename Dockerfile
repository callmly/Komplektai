# =========================
# Build stage
# =========================
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (including devDependencies, needed for build tools like tsc/vite/etc.)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build


# =========================
# Production stage
# =========================
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy build output from build stage
COPY --from=build /app/dist ./dist

# If your app needs other runtime assets, uncomment and adapt:
# COPY --from=build /app/public ./public
# COPY --from=build /app/views ./views
# COPY --from=build /app/prisma ./prisma

EXPOSE 5000

# Start the server
CMD ["node", "dist/index.js"]

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (if needed for native modules)
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN echo "Starting build..." && \
    npm run build && \
    echo "Build completed!" && \
    ls -la dist/

EXPOSE 5000

# Start the server
CMD ["node", "dist/index.js"]

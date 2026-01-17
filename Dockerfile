FROM node:20-alpine AS builder

# Build arguments for environment variables
ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

WORKDIR /app

# Install build dependencies (if needed)
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Build with verbose logging
RUN echo "=== Starting build ===" && \
    npm run build 2>&1 | tee build.log || (cat build.log && exit 1)

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Build arguments (again for production stage)
ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

ENV NODE_ENV=production
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5000

# Start the server
CMD ["node", "dist/index.js"]

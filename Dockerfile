FROM node:20-alpine AS builder

ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

WORKDIR /app

# Install build dependencies (for native modules like pg)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Build the application
RUN npm run build

# Check what was built
RUN ls -la dist/

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

ENV NODE_ENV=production
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Install runtime dependencies only
COPY package*.json ./
RUN npm ci --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy other necessary files (adjust if needed)
COPY --from=builder /app/db ./db

EXPOSE 5000

# Start the application (from package.json: "start": "NODE_ENV=production node dist/index.cjs")
CMD ["npm", "start"]

FROM node:20-alpine AS builder

ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++ git

COPY package*.json ./

# Install with verbose logging
RUN npm ci 2>&1 | tail -20

COPY . .

# Show what we have
RUN echo "=== PROJECT STRUCTURE ===" && \
    ls -la && \
    echo "=== CHECKING CRITICAL FILES ===" && \
    (test -f server/index.ts && echo "✓ server/index.ts exists" || echo "✗ server/index.ts MISSING") && \
    (test -f script/build.ts && echo "✓ script/build.ts exists" || echo "✗ script/build.ts MISSING") && \
    (test -f vite.config.ts && echo "✓ vite.config.ts exists" || (test -f vite.config.js && echo "✓ vite.config.js exists") || echo "✗ vite.config MISSING") && \
    (test -f index.html && echo "✓ index.html exists" || echo "✗ index.html MISSING")

ENV NODE_ENV=production
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Try build with detailed output
RUN echo "=== ATTEMPTING BUILD ===" && \
    npm run build 2>&1 || (echo "=== BUILD COMMAND FAILED ===" && \
    echo "=== Trying to show what happened ===" && \
    ls -la && exit 1)

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

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.cjs"]

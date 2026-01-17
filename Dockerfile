FROM node:20-alpine AS builder

ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Show what we're installing
RUN echo "=== Installing dependencies ===" && \
    npm ci --verbose

COPY . .

# Show environment (without secrets)
RUN echo "=== Environment check ===" && \
    echo "NODE_ENV: $NODE_ENV" && \
    echo "RESEND_API_KEY set: $([ -n "$RESEND_API_KEY" ] && echo 'YES' || echo 'NO')" && \
    echo "SESSION_SECRET set: $([ -n "$SESSION_SECRET" ] && echo 'YES' || echo 'NO')" && \
    echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"

ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Show package.json scripts
RUN echo "=== Package.json scripts ===" && \
    cat package.json | grep -A 10 '"scripts"'

# Try to build with full error output
RUN echo "=== Starting build ===" && \
    npm run build --verbose 2>&1 || (echo "=== BUILD FAILED ===" && exit 1)

# Show what was created
RUN echo "=== Build output ===" && \
    ls -la && \
    find . -type f -name "*.mjs" -o -name "*.js" | head -20

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

COPY --from=builder /app ./

EXPOSE 5000

CMD ["sh", "-c", "if [ -f ./server/entry.mjs ]; then node ./server/entry.mjs; elif [ -f ./.output/server/entry.mjs ]; then node ./.output/server/entry.mjs; elif [ -f ./dist/index.js ]; then node ./dist/index.js; else node ./index.js; fi"]

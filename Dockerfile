FROM node:20-alpine AS builder

ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

RUN npm run build

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

# Copy everything from builder
COPY --from=builder /app ./

EXPOSE 5000

# Try to start from common locations
CMD ["sh", "-c", "if [ -f ./server/entry.mjs ]; then node ./server/entry.mjs; elif [ -f ./.output/server/entry.mjs ]; then node ./.output/server/entry.mjs; elif [ -f ./dist/index.js ]; then node ./dist/index.js; else node ./index.js; fi"]

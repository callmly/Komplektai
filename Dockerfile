FROM node:20-alpine

WORKDIR /app

# Build arguments
ARG RESEND_API_KEY
ARG SESSION_SECRET
ARG DATABASE_URL

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Build
RUN npm run build

EXPOSE 5000

# Start
CMD ["npm", "start"]

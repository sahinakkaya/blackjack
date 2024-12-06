# 1. Base Image
FROM node:20-alpine AS base

# Install dependencies like libc6-compat if required
RUN apk add --no-cache libc6-compat

# Set the working directory
WORKDIR /app

# Enable Corepack and configure Yarn version
RUN corepack enable
RUN yarn set version 4.1.0

# 2. Dependencies Layer
FROM base AS deps

# Copy dependency management files
COPY package.json yarn.lock ./

# Install dependencies
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 3. Build Layer
FROM base AS builder

# Copy app source and installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set the environment to production
ENV NODE_ENV=production

# Build the app
RUN yarn build

# 4. Runner (Production Image)
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Add a non-root user for better security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001
USER appuser

# Copy built files and dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose the port the app will run on
EXPOSE 3000

# Command to run the app
CMD ["node", "build/server.js"]

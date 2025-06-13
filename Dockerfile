# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage (Build on base stage)
FROM base AS development
# Set environment variable
ENV NODE_ENV=docker
# Install all dependencies (including dev ones)
RUN npm install
# Copy all source code
COPY . .
# Tell Docker which ports to expose
EXPOSE 3001
EXPOSE 9229
CMD ["npm", "run", "dev:docker"]

# Production dependencies stage
FROM base AS production-deps
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 3001
# Runs as non-root user for security
USER node
CMD ["npm", "start"]
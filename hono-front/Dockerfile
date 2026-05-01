FROM node:20-alpine AS build

WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Build the project (if needed, but tsx can run it directly, or tsc)
RUN npm run build

FROM node:20-alpine AS run

WORKDIR /app

# Copy from build
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev

# Need to copy the static files since Hono is serving them from ../pc builder
# But in Docker, we will mount the pc builder volume, or we can copy it.
# The user's docker-compose currently mounts it.

EXPOSE 3000

CMD ["node", "dist/index.js"]

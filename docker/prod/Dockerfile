# =============================================================================
# CSC Dashboard — PROD Dockerfile (Multi-stage)
# =============================================================================
# Stage 1: Build the Vite app
# Stage 2: Serve via nginx:alpine (~25 MB final image)
# =============================================================================

# --------------- Stage 1: Build ---------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests (layer cache optimization)
COPY package.json package-lock.json ./

# Install production + dev dependencies (needed for build)
RUN npm ci

# Copy source code and config files
COPY . .

# Build the production bundle
# Uses BuildKit secret: .env is mounted temporarily during this step only.
# It never appears in any image layer (unlike ARG/ENV which leak in docker history).
RUN --mount=type=secret,id=env_file,target=/app/.env \
    npm run build

# --------------- Stage 2: Serve ---------------
FROM nginx:alpine AS runner

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY docker/prod/nginx.conf /etc/nginx/conf.d/default.conf

# Nginx runs on port 80 by default
EXPOSE 80

# nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]

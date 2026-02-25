# =============================================================================
# CSC Dashboard — DEV Dockerfile
# =============================================================================
# Runs the Vite dev server with HMR support inside Docker.
# Source code is bind-mounted at runtime (not copied).
# =============================================================================

FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Source code is mounted as a volume at runtime — no COPY here.
# node_modules are kept in-container via anonymous volume.

# Vite dev server port
EXPOSE 5173

# Enable polling for file watchers on Windows/Docker Desktop
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

CMD ["npx", "vite", "--host", "0.0.0.0"]

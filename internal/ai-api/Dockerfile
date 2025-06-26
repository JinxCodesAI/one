# Dockerfile for AI API Development
# See docs/development/ADRs/Docker_Compose_Strategy.md for full implementation plan

FROM denoland/deno:2.3.6

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json deno.lock* ./
COPY internal/ai-api/deno.json ./internal/ai-api/

# Cache dependencies
RUN deno cache internal/ai-api/main.ts || echo "Cache failed, will retry with source"

# Copy source code
COPY . .

# Cache dependencies again with full source (in case workspace imports are needed)
RUN deno cache internal/ai-api/main.ts

# Expose port
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["deno", "task", "--cwd", "internal/ai-api", "start"]

# Dockerfile for AI Chat Development
# See docs/development/ADRs/Docker_Compose_Strategy.md for full implementation plan

FROM denoland/deno:2.3.6

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json deno.lock* ./
COPY web/ai-chat/deno.json ./web/ai-chat/

# Cache dependencies
RUN deno cache web/ai-chat/src/main.tsx || echo "Cache failed, will retry with source"

# Copy source code
COPY . .

# Cache dependencies again with full source (in case workspace imports are needed)
RUN deno cache web/ai-chat/src/main.tsx

# Expose port
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["deno", "task", "--cwd", "web/ai-chat", "dev", "--host", "0.0.0.0"]

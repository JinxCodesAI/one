# ADR: Docker Compose Strategy for Development and Production

**Status**: Proposed\
**Date**: 2025-06-21\
**Authors**: Development Team\
**Reviewers**: DevOps Team, Architecture Team

## Context

The current project has Docker support for cross-compilation (AI API service)
but lacks Docker Compose orchestration for development and production
environments. We need to evaluate whether Docker Compose is necessary and
beneficial for our monorepo architecture.

## Current State Analysis

### Existing Docker Infrastructure

- ✅ **AI API**: `Dockerfile.build` for cross-compilation (Windows → Linux)
- ✅ **Build Script**: `build-linux.ps1` for automated binary creation
- ✅ **Production Deployment**: Systemd service configuration
- ❌ **No Docker Compose**: No orchestration for multi-service development
- ❌ **No Development Containers**: Services run directly with Deno

### Current Development Workflow

```bash
# Current approach - native Deno execution
just dev-all          # Starts both services natively
just dev-api          # AI API on port 8000
just dev-chat         # AI Chat on port 3000
```

### Current Production Deployment

1. **Cross-compile** AI API using Docker
2. **Deploy binary** to Linux server
3. **Run as systemd service**
4. **AI Chat** builds to static files (Vite)

## Decision Options

### Option 1: Add Full Docker Compose (Recommended)

**Pros:**

- **Environment Consistency**: Identical dev/prod environments
- **Dependency Isolation**: No local Deno/Node.js version conflicts
- **Easy Onboarding**: New developers just run `docker-compose up`
- **Service Discovery**: Built-in networking between services
- **Production Parity**: Same containers in dev and prod
- **External Dependencies**: Easy to add databases, Redis, etc.

**Cons:**

- **Performance Overhead**: Slower than native execution
- **Complexity**: Additional Docker knowledge required
- **File Watching**: Hot reload may be slower in containers
- **Resource Usage**: Higher memory/CPU usage

### Option 2: Hybrid Approach (Current + Compose)

**Pros:**

- **Flexibility**: Developers choose native or containerized
- **Performance**: Native development remains fast
- **Testing**: Containerized integration testing
- **Production**: Container-based deployment

**Cons:**

- **Maintenance**: Two development paths to maintain
- **Inconsistency**: Different environments may have different issues

### Option 3: Keep Current Approach

**Pros:**

- **Performance**: Fastest development experience
- **Simplicity**: No Docker complexity for development
- **Working**: Current system functions well

**Cons:**

- **Environment Drift**: Dev/prod differences
- **Onboarding**: Requires local Deno installation
- **Scaling**: Harder to add external dependencies

## Recommendation: Option 1 (Full Docker Compose)

Based on the analysis, we recommend implementing Docker Compose for the
following reasons:

1. **Future-Proofing**: As the monorepo grows, containerization becomes
   essential
2. **External Dependencies**: Likely need for databases, caching, message queues
3. **Team Scaling**: Easier onboarding for new developers
4. **Production Parity**: Reduces "works on my machine" issues

## Implementation Plan

### Phase 1: Basic Docker Compose Setup

#### 1.1 Create Service Dockerfiles

**AI API Dockerfile** (`internal/ai-api/Dockerfile`):

```dockerfile
FROM denoland/deno:2.3.6

WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json deno.lock* ./
COPY internal/ai-api/deno.json ./internal/ai-api/

# Cache dependencies
RUN deno cache internal/ai-api/main.ts

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["deno", "task", "--cwd", "internal/ai-api", "start"]
```

**AI Chat Dockerfile** (`web/ai-chat/Dockerfile`):

```dockerfile
FROM denoland/deno:2.3.6

WORKDIR /app

# Copy dependency files
COPY deno.json deno.lock* ./
COPY web/ai-chat/deno.json ./web/ai-chat/

# Cache dependencies
RUN deno cache web/ai-chat/src/main.tsx

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["deno", "task", "--cwd", "web/ai-chat", "dev", "--host", "0.0.0.0"]
```

#### 1.2 Create Docker Compose Configuration

**Development** (`docker-compose.dev.yml`):

```yaml
version: "3.8"

services:
  ai-api:
    build:
      context: .
      dockerfile: internal/ai-api/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - HOST=0.0.0.0
    env_file:
      - internal/ai-api/.env
    volumes:
      - .:/app
      - /app/node_modules
    command: [
      "deno",
      "task",
      "--cwd",
      "internal/ai-api",
      "dev",
      "--host",
      "0.0.0.0",
    ]
    networks:
      - ai-network

  ai-chat:
    build:
      context: .
      dockerfile: web/ai-chat/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://ai-api:8000
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - ai-api
    networks:
      - ai-network

networks:
  ai-network:
    driver: bridge
```

**Production** (`docker-compose.prod.yml`):

```yaml
version: "3.8"

services:
  ai-api:
    build:
      context: .
      dockerfile: internal/ai-api/Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - PORT=8000
      - HOST=0.0.0.0
    env_file:
      - internal/ai-api/.env.prod
    restart: unless-stopped
    networks:
      - ai-network

  ai-chat:
    build:
      context: .
      dockerfile: web/ai-chat/Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - ai-api
    restart: unless-stopped
    networks:
      - ai-network

networks:
  ai-network:
    driver: bridge
```

#### 1.3 Update `justfile` with Docker Commands

```makefile
# Docker Compose Commands
docker-dev:
    @echo "🐳 Starting all services with Docker Compose (development)..."
    @docker-compose -f docker-compose.dev.yml up --build

docker-prod:
    @echo "🐳 Starting all services with Docker Compose (production)..."
    @docker-compose -f docker-compose.prod.yml up -d --build

docker-stop:
    @echo "🛑 Stopping Docker Compose services..."
    @docker-compose -f docker-compose.dev.yml down
    @docker-compose -f docker-compose.prod.yml down

docker-logs:
    @echo "📋 Showing Docker Compose logs..."
    @docker-compose -f docker-compose.dev.yml logs -f

docker-clean:
    @echo "🧹 Cleaning Docker resources..."
    @docker-compose -f docker-compose.dev.yml down -v --rmi all
    @docker system prune -f

# Hybrid commands (both native and Docker options)
dev-all-docker: docker-dev
dev-all-native: dev-all
```

### Phase 2: Enhanced Features

#### 2.1 Add External Dependencies

```yaml
# Add to docker-compose.dev.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - ai-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_chat
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ai-network

volumes:
  postgres_data:
```

#### 2.2 Development Tools Container

```yaml
services:
  dev-tools:
    build:
      context: .
      dockerfile: Dockerfile.dev-tools
    volumes:
      - .:/app
    working_dir: /app
    command: tail -f /dev/null # Keep container running
    networks:
      - ai-network
```

### Phase 3: CI/CD Integration

#### 3.1 GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build and Test

on: [push, pull_request]

jobs:
  docker-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and test with Docker Compose
        run: |
          docker-compose -f docker-compose.dev.yml build
          docker-compose -f docker-compose.dev.yml run --rm ai-api deno task test
          docker-compose -f docker-compose.dev.yml run --rm ai-chat deno task test
```

## Migration Strategy

### For Developers

1. **Optional Initially**: Keep native development as default
2. **Gradual Adoption**: Introduce Docker commands alongside existing ones
3. **Documentation**: Clear guides for both approaches
4. **Training**: Team sessions on Docker Compose usage

### Implementation Timeline

- **Week 1**: Create basic Dockerfiles and compose files
- **Week 2**: Update justfile and test Docker development workflow
- **Week 3**: Add external dependencies and production configurations
- **Week 4**: Update documentation and team training

## Consequences

### Positive

- **Environment Consistency**: Eliminates "works on my machine" issues
- **Easy Onboarding**: New developers can start with `just docker-dev`
- **Scalability**: Easy to add databases, caching, message queues
- **Production Parity**: Same containers in development and production
- **Isolation**: No conflicts with local development tools

### Negative

- **Performance**: Slower than native development (especially file watching)
- **Complexity**: Additional Docker knowledge required
- **Resource Usage**: Higher memory and CPU usage
- **Learning Curve**: Team needs to learn Docker Compose

## Alternatives Considered

1. **Kubernetes**: Too complex for current scale
2. **Podman**: Less ecosystem support than Docker
3. **Native Only**: Doesn't address scaling concerns
4. **VM-based**: Heavier than containers

## Success Metrics

- **Onboarding Time**: New developer setup < 15 minutes
- **Environment Issues**: Reduce "works on my machine" by 90%
- **Development Speed**: Hot reload within 2 seconds
- **Resource Usage**: < 4GB RAM for full development stack

## Related Documents

- [Adding New Projects to Monorepo](./Adding_New_Projects_to_Monorepo.md)
- [AI API Deployment Guide](../../ai-api/DEPLOYMENT.md)
- [Testing Infrastructure](./Testing_Guide_Comprehensive.md)

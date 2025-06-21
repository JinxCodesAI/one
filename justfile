# Automatically load variables from .env for Docker
set dotenv-load

# Set PATH to include Deno
export PATH := env_var('HOME') + "/.deno/bin:" + env_var('PATH')

# --- High-Level Aliases ---
test: test-unit test-e2e   # Run all tests
dev: dev-api dev-chat      # Run all dev servers

# --- Unit Testing ---
test-unit:
    @echo "🔬 Running all unit tests..."
    @cd internal/ai-api && deno task test
    @cd ../../web/ai-chat && deno task test
    @cd ../../packages/testing-infrastructure && deno task test

# --- E2E Testing (with infrastructure management) ---
test-e2e: test-e2e-api test-e2e-chat

test-e2e-api: up-api
    @echo "🌐 Running AI-API E2E tests..."
    @# The || true ensures the 'down' command always runs
    @(cd internal/ai-api && deno task test:e2e || true)
    @just down-api

test-e2e-chat:
    @echo "🌐 Running ai-chat E2E tests..."
    @cd web/ai-chat && deno task test:e2e

# --- Development Tasks ---
dev-api:
    @echo "🚀 Starting API server..."
    @cd internal/ai-api && deno task dev

dev-chat:
    @echo "🚀 Starting Chat app..."
    @cd web/ai-chat && deno task dev

# --- Infrastructure Management Recipes ---
up-api:
    @echo "🐘 Starting PostgreSQL for API..."
    @docker-compose -f docker-compose.yml -f docker-compose.api.yml up -d

down-api:
    @echo "🐘 Stopping PostgreSQL for API..."
    @docker-compose -f docker-compose.yml -f docker-compose.api.yml down --volumes -t 1

# Database commands
db-migrate:
    @echo "🗄️ Running database migrations..."
    # TODO: Implement database migration logic

db-seed:
    @echo "🌱 Seeding database..."
    # TODO: Implement database seeding logic

db-reset:
    @echo "🔄 Resetting database..."
    # TODO: Implement database reset logic

# Cleanup commands
clean:
    @echo "🧹 Cleaning build artifacts..."
    cd internal/ai-api && rm -rf dist/ coverage/
    cd web/ai-chat && rm -rf dist/ coverage/ node_modules/
    cd packages/testing-infrastructure && rm -rf coverage/

clean-all:
    @echo "🧹 Deep cleaning all artifacts..."
    just clean
    docker-compose -f infrastructure/docker-compose.yml down -v
    docker system prune -f

# Health check commands
health:
    @echo "🏥 Checking service health..."
    just health-api
    just health-chat

health-api:
    @echo "🔧 Checking AI-API health..."
    curl -f http://localhost:8000/health || echo "❌ AI-API not responding"

health-chat:
    @echo "💬 Checking AI-Chat health..."
    curl -f http://localhost:5173 || echo "❌ AI-Chat not responding"

# Deployment commands
deploy-prepare:
    @echo "📦 Preparing for deployment..."
    just test
    just build
    just typecheck

deploy-api:
    @echo "🚀 Deploying AI-API..."
    # TODO: Implement API deployment logic

deploy-chat:
    @echo "🚀 Deploying AI-Chat..."
    # TODO: Implement Chat deployment logic

# Utility commands
install:
    @echo "📦 Installing dependencies..."
    deno install --allow-scripts

update:
    @echo "🔄 Updating dependencies..."
    cd internal/ai-api && deno cache --reload **/*.ts
    cd web/ai-chat && deno cache --reload **/*.ts
    cd packages/testing-infrastructure && deno cache --reload **/*.ts

# CI/CD commands
ci-test:
    @echo "🤖 Running CI test suite..."
    just lint
    just typecheck
    just test

ci-build:
    @echo "🤖 Running CI build..."
    just build

ci-deploy:
    @echo "🤖 Running CI deployment..."
    just deploy-prepare
    just deploy-api
    just deploy-chat

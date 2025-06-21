# One Monorepo Task Runner
# Uses just (https://just.systems) for task orchestration

# Set PATH to include Deno
export PATH := env_var('HOME') + "/.deno/bin:" + env_var('PATH')

# Default recipe - show available commands
default:
    @just --list

# Development commands
dev-api:
    @echo "🚀 Starting AI-API development server..."
    cd internal/ai-api && deno task dev

dev-chat:
    @echo "🚀 Starting AI-Chat development server..."
    cd web/ai-chat && deno task dev

dev-all:
    @echo "🚀 Starting all development servers..."
    just dev-api &
    just dev-chat &
    wait

# Production commands
start-api:
    @echo "🏭 Starting AI-API production server..."
    cd internal/ai-api && deno task start

start-chat:
    @echo "🏭 Starting AI-Chat production server..."
    cd web/ai-chat && deno task preview

# Build commands
build:
    @echo "🔨 Building all projects..."
    just build-api
    just build-chat

build-api:
    @echo "🔨 Building AI-API..."
    cd internal/ai-api && deno task build

build-chat:
    @echo "🔨 Building AI-Chat..."
    cd web/ai-chat && deno task build

# Testing commands
test:
    @echo "🧪 Running all tests..."
    just test-unit
    just test-e2e

test-unit:
    @echo "🔬 Running unit tests..."
    cd internal/ai-api && deno task test
    cd web/ai-chat && deno task test
    cd packages/testing-infrastructure && deno task test

test-e2e:
    @echo "🌐 Running E2E tests..."
    just infra-start
    cd internal/ai-api && deno task test:e2e
    cd web/ai-chat && deno task test:e2e
    just infra-stop

test-api:
    @echo "🔧 Testing AI-API..."
    cd internal/ai-api && deno task test && deno task test:e2e

test-chat:
    @echo "💬 Testing AI-Chat..."
    cd web/ai-chat && deno task test && deno task test:e2e

# Quality assurance commands
lint:
    @echo "🔍 Linting all projects..."
    cd internal/ai-api && deno lint
    cd web/ai-chat && deno lint
    cd packages/testing-infrastructure && deno lint

lint-fix:
    @echo "🔧 Fixing lint issues..."
    cd internal/ai-api && deno lint --fix
    cd web/ai-chat && deno lint --fix
    cd packages/testing-infrastructure && deno lint --fix

format:
    @echo "✨ Formatting all projects..."
    cd internal/ai-api && deno fmt
    cd web/ai-chat && deno fmt
    cd packages/testing-infrastructure && deno fmt

format-check:
    @echo "📋 Checking code formatting..."
    cd internal/ai-api && deno fmt --check
    cd web/ai-chat && deno fmt --check
    cd packages/testing-infrastructure && deno fmt --check

typecheck:
    @echo "🔎 Type checking all projects..."
    cd internal/ai-api && deno check **/*.ts
    cd web/ai-chat && deno check src/**/*.ts src/**/*.tsx
    cd packages/testing-infrastructure && deno check src/**/*.ts

# Infrastructure commands
infra-start:
    @echo "🐳 Starting infrastructure services..."
    docker-compose -f infrastructure/docker-compose.yml up -d

infra-stop:
    @echo "🛑 Stopping infrastructure services..."
    docker-compose -f infrastructure/docker-compose.yml down

infra-restart:
    @echo "🔄 Restarting infrastructure services..."
    just infra-stop
    just infra-start

infra-logs:
    @echo "📋 Showing infrastructure logs..."
    docker-compose -f infrastructure/docker-compose.yml logs -f

infra-status:
    @echo "📊 Infrastructure status..."
    docker-compose -f infrastructure/docker-compose.yml ps

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

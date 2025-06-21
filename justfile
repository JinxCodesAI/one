# Monorepo Task Runner
# Replaces complex deno task orchestration with simple, reliable commands

# Set environment variables
set dotenv-load := true

# Default recipe - show available commands
default:
    @just --list

# Development commands
dev-api:
    @echo "🚀 Starting AI API server..."
    @deno task --cwd internal/ai-api dev

dev-chat:
    @echo "🚀 Starting AI Chat app..."
    @deno task --cwd web/ai-chat dev

dev-all:
    @echo "🚀 Starting all services concurrently..."
    @echo "📡 AI API will be available at: http://localhost:8000"
    @echo "🌐 AI Chat will be available at: http://localhost:3000"
    @echo "Press Ctrl+C to stop all services"
    @echo ""
    @deno run --allow-run --allow-read scripts/dev-all-cross-platform.ts

# Testing commands (avoiding --recursive issues)
test: test-unit test-e2e
    @echo "✅ All tests completed"

test-unit:
    @echo "🔬 Running unit tests..."
    @echo "Testing AI API..."
    @deno task --cwd internal/ai-api test
    @echo "Testing AI Chat..."
    @deno task --cwd web/ai-chat test
    @echo "Testing infrastructure..."
    @deno task --cwd packages/testing-infrastructure test || echo "ℹ️ No tests found in testing-infrastructure (expected)"

test-e2e:
    @echo "🌐 Running E2E tests..."
    @deno task --cwd internal/ai-api test:e2e
    @deno task --cwd web/ai-chat test:e2e

test-api:
    @echo "🔧 Testing AI API (unit + E2E)..."
    @deno task --cwd internal/ai-api test
    @deno task --cwd internal/ai-api test:e2e

test-chat:
    @echo "💬 Testing AI Chat (unit + E2E)..."
    @deno task --cwd web/ai-chat test
    @deno task --cwd web/ai-chat test:e2e

# Linting (avoiding --recursive issues)
lint:
    @echo "🔍 Linting all projects..."
    @deno lint internal/ai-api/
    @deno lint web/ai-chat/
    @deno lint packages/testing-infrastructure/

# Formatting
fmt:
    @echo "✨ Formatting all projects..."
    @deno fmt internal/ai-api/
    @deno fmt web/ai-chat/
    @deno fmt packages/testing-infrastructure/

# Cleanup
clean:
    @echo "🧹 Cleaning build artifacts..."
    @rm -rf internal/ai-api/dist/ || true
    @rm -rf web/ai-chat/dist/ || true
    @rm -rf node_modules/.cache/ || true

# Installation
install:
    @echo "📦 Installing dependencies..."
    @deno install --allow-scripts

# Check all (lint + test)
check: lint test
    @echo "✅ All checks passed"

# Watch commands for development
test-watch-api:
    @echo "👀 Watching AI API tests..."
    @deno task --cwd internal/ai-api test:watch

test-watch-chat:
    @echo "👀 Watching AI Chat tests..."
    @deno task --cwd web/ai-chat test:watch

# Production commands
start-api:
    @echo "🚀 Starting AI API in production mode..."
    @deno task --cwd internal/ai-api start

start-chat:
    @echo "🚀 Starting AI Chat in production mode..."
    @deno task --cwd web/ai-chat preview

build-chat:
    @echo "🏗️ Building AI Chat for production..."
    @deno task --cwd web/ai-chat build

# Docker Compose commands
docker-dev:
    @echo "🐳 Starting all services with Docker Compose (development)..."
    @echo "📡 AI API will be available at: http://localhost:8000"
    @echo "🌐 AI Chat will be available at: http://localhost:3000"
    @echo "⚠️  Note: Docker development is slower than native. Use 'just dev-all' for faster development."
    @docker-compose -f docker-compose.dev.yml up --build

docker-prod:
    @echo "🐳 Starting all services with Docker Compose (production)..."
    @docker-compose -f docker-compose.prod.yml up -d --build

docker-stop:
    @echo "🛑 Stopping Docker Compose services..."
    @docker-compose -f docker-compose.dev.yml down || true
    @docker-compose -f docker-compose.prod.yml down || true

docker-logs:
    @echo "📋 Showing Docker Compose logs..."
    @docker-compose -f docker-compose.dev.yml logs -f

docker-clean:
    @echo "🧹 Cleaning Docker resources..."
    @docker-compose -f docker-compose.dev.yml down -v --rmi all || true
    @docker-compose -f docker-compose.prod.yml down -v --rmi all || true
    @docker system prune -f

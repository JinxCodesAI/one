# Monorepo Task Runner
# Uses proc-runner for reliable service orchestration

# Set environment variables
set dotenv-load := true

# Shell configuration - defaults to sh for Unix compatibility
# Windows users should run 'just setup' to configure PowerShell
set shell := ["powershell.exe", "-c"]

# Default recipe - show available commands
default:
    @just --list

# Setup justfile for current OS (run this first on new systems)
setup:
    @echo "🔧 Configuring justfile for your operating system..."
    @deno run --allow-read --allow-write scripts/setup-justfile.ts
    @echo "✅ Setup complete! You can now use all just commands."

# Development commands - much simpler with proc-runner
dev-all:
    @echo "🚀 Starting all services with proc-runner..."
    @echo "📡 AI API will be available at: http://localhost:8000"
    @echo "🌐 AI Chat will be available at: http://localhost:3000"
    @echo "Press Ctrl+C to stop all services"
    @echo ""
    @deno run --allow-run --allow-read --allow-env -A proc-runner

# Individual service commands (for development)
dev-api:
    @echo "🚀 Starting AI API server..."
    @deno task --cwd internal/ai-api dev

dev-chat:
    @echo "🚀 Starting AI Chat app..."
    @deno task --cwd web/ai-chat dev

# Utility commands
install:
    @echo "📦 Installing dependencies..."
    @deno task install

# Docker Compose commands (keeping as requested)
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
    @docker-compose -f docker-compose.dev.yml down
    @docker-compose -f docker-compose.prod.yml down

docker-logs:
    @echo "📋 Showing Docker Compose logs..."
    @docker-compose -f docker-compose.dev.yml logs -f

docker-clean:
    @echo "🧹 Cleaning Docker resources..."
    @docker system prune -f
    @docker volume prune -f

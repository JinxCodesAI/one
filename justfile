# Task System Orchestration
# High-level aliases for common workflows

# --- High-Level Aliases ---
test: test-unit test-e2e

dev: dev-api dev-chat

# --- Unit Testing ---
test-unit:
    @echo "🔬 Running all unit tests..."
    @cd internal/ai-api && deno task test
    @cd web/ai-chat && deno task test
    @cd packages/testing-infrastructure && deno task test

# --- E2E Testing ---
test-e2e: test-e2e-api test-e2e-chat

test-e2e-api:
    @echo "🌐 Running AI-API E2E tests..."
    @cd internal/ai-api && deno task test:e2e

test-e2e-chat: start-api-background
    @echo "🌐 Running ai-chat E2E tests..."
    @cd web/ai-chat && deno task test:e2e

# --- Development Tasks ---
dev-api:
    @echo "🚀 Starting AI-API development server..."
    @cd internal/ai-api && deno task dev

dev-chat:
    @echo "🚀 Starting ai-chat development server..."
    @cd web/ai-chat && deno task dev

# --- Helper Tasks ---
start-api-background:
    @echo "🚀 Starting AI-API server in background for E2E tests..."
    @cd internal/ai-api && deno task start &



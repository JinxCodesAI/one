# Development Guide

This monorepo contains two main services:

- **AI API Service** (`internal/ai-api`) - Backend API service on port 8000
- **AI Chat Web App** (`web/ai-chat`) - Frontend web application on port 3000

## Prerequisites

- [Deno](https://deno.land/) 2.3.6+
- [just](https://github.com/casey/just) task runner

### Windows Setup Notes

The project is fully compatible with Windows. The `justfile` uses `proc-runner`
for reliable cross-platform service orchestration.

**Installation on Windows:**

```powershell
# Install just via Chocolatey (recommended)
choco install just

# Or via Scoop
scoop install just
```

**Common Windows Issues:**

- If you see "cygpath" errors, make sure you're using the latest version of the
  repository
- PowerShell execution policy may need to be adjusted for some commands
- All development commands work the same on Windows, macOS, and Linux

## Quick Start

### Option 1: Start Both Services (Recommended)

```bash
# Start both AI API and AI Chat services concurrently
just dev-all
```

This will start:

- AI API service at `http://localhost:8000`
- AI Chat web app at `http://localhost:3000`

### Option 2: Start Services Individually

#### Start AI API Service Only

```bash
just dev-api
# or
cd internal/ai-api && deno task dev
```

#### Start AI Chat Service Only

```bash
just dev-chat
# or
cd web/ai-chat && deno task dev
```

#### Start AI Chat with API Dependency Check

```bash
cd web/ai-chat && deno task dev:with-api
```

This will wait for the AI API service to be ready before starting the chat app.

## Environment Setup

### AI API Service

1. Copy the environment file:
   ```bash
   cp internal/ai-api/.env.example internal/ai-api/.env
   ```

2. Add your API keys to `internal/ai-api/.env`:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   ```

3. At least one provider API key is required.

## Service Architecture

```
┌─────────────────┐    HTTP     ┌─────────────────┐
│   AI Chat       │ ──────────► │   AI API        │
│   (Port 3000)   │             │   (Port 8000)   │
│                 │             │                 │
│ - React UI      │             │ - OpenAI        │
│ - Chat Interface│             │ - Google AI     │
│ - Model Selector│             │ - OpenRouter    │
└─────────────────┘             └─────────────────┘
```

## Available Tasks

### Development Commands

- `just dev-all` - Start both services concurrently using proc-runner (primary command)
- `just dev-api` - Start only AI API service (for debugging)
- `just dev-chat` - Start only AI Chat service (for debugging)

**Note**: The primary development workflow uses `just dev-all` which automatically
starts all services via `proc-runner`, handling dependencies and startup order.

### Docker Commands

- `just docker-dev` - Start all services with Docker Compose (development)
- `just docker-prod` - Start all services with Docker Compose (production)
- `just docker-stop` - Stop Docker services
- `just docker-logs` - View Docker logs
- `just docker-clean` - Clean Docker resources

### Utility Commands

- `just setup` - Configure justfile for your OS (required for Windows)
- `just install` - Install dependencies (runs `deno install`)

### Individual Project Tasks

You can still use `deno task` within individual projects:

#### AI API Service (`internal/ai-api`)

- `deno task dev` - Development server with hot reload
- `deno task start` - Production server
- `deno task test` - Run unit tests
- `deno task test:e2e` - Run end-to-end tests

#### AI Chat Service (`web/ai-chat`)

- `deno task dev` - Development server with hot reload
- `deno task preview` - Production preview server
- `deno task build` - Build for production

## Troubleshooting

### "Loading models..." Issue

If the AI Chat app shows "Loading models..." permanently:

1. **Check if AI API service is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Start the AI API service:**
   ```bash
   just dev-api
   ```

3. **Check environment variables:** Make sure you have at least one API key
   configured in `internal/ai-api/.env`

### Port Conflicts

- AI API uses port 8000
- AI Chat uses port 3000

If these ports are in use, you can modify the ports in:

- AI API: `internal/ai-api/.env` (PORT variable)
- AI Chat: `web/ai-chat/src/server.tsx` (PORT constant)

## Development Workflow

1. **First time setup:**
   ```bash
   # Install dependencies
   just install

   # Configure environment
   cp internal/ai-api/.env.example internal/ai-api/.env
   # Edit internal/ai-api/.env with your API keys

   # Start both services
   just dev-all
   ```

2. **Daily development:**
   ```bash
   # Start both services
   just dev-all

   # Open browser to http://localhost:3000
   ```

3. **Testing workflow:**
   ```bash
   # Run tests for individual projects
   cd internal/ai-api && deno task test
   cd web/ai-chat && deno task test

   # Run E2E tests
   cd internal/ai-api && deno task test:e2e
   cd web/ai-chat && deno task test:e2e

   # Watch tests during development
   cd internal/ai-api && deno task test:watch
   cd web/ai-chat && deno task test:watch
   ```

4. **Code quality:**
   ```bash
   # Format and lint individual projects
   cd internal/ai-api && deno fmt && deno lint
   cd web/ai-chat && deno fmt && deno lint
   cd packages/testing-infrastructure && deno fmt && deno lint
   ```

5. **Working on individual services:**
   ```bash
   # API only
   just dev-api
   # or
   cd internal/ai-api && deno task dev

   # Chat only (requires API to be running)
   just dev-chat
   # or
   cd web/ai-chat && deno task dev
   ```

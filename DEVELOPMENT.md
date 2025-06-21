# Development Guide

This monorepo contains two main services:
- **AI API Service** (`internal/ai-api`) - Backend API service on port 8000
- **AI Chat Web App** (`web/ai-chat`) - Frontend web application on port 3000

## Prerequisites

- [Deno](https://deno.land/) 2.3.6+
- [just](https://github.com/casey/just) task runner

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
- `just dev-all` - Start both services concurrently
- `just dev-api` - Start only AI API service
- `just dev-chat` - Start only AI Chat service

### Testing Commands
- `just test` - Run all tests (unit + E2E)
- `just test-unit` - Run unit tests only
- `just test-e2e` - Run E2E tests only
- `just test-api` - Run AI API tests (unit + E2E)
- `just test-chat` - Run AI Chat tests (unit + E2E)
- `just test-watch-api` - Watch AI API tests
- `just test-watch-chat` - Watch AI Chat tests

### Code Quality Commands
- `just lint` - Lint all projects
- `just fmt` - Format all projects
- `just check` - Run lint + test

### Production Commands
- `just build-chat` - Build AI Chat for production
- `just start-api` - Start AI API in production mode
- `just start-chat` - Start AI Chat in production mode

### Utility Commands
- `just install` - Install dependencies
- `just clean` - Clean build artifacts

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

3. **Check environment variables:**
   Make sure you have at least one API key configured in `internal/ai-api/.env`

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
   # Run all tests
   just test

   # Run specific test types
   just test-unit
   just test-e2e

   # Watch tests during development
   just test-watch-api
   just test-watch-chat
   ```

4. **Code quality:**
   ```bash
   # Format and lint code
   just fmt
   just lint

   # Run all checks
   just check
   ```

3. **Working on individual services:**
   ```bash
   # API only
   deno task dev:api
   
   # Chat only (requires API to be running)
   deno task dev:chat
   ```

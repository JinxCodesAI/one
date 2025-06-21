# Development Guide

This monorepo contains two main services:
- **AI API Service** (`internal/ai-api`) - Backend API service on port 8000
- **AI Chat Web App** (`web/ai-chat`) - Frontend web application on port 3000

## Quick Start

### Option 1: Start Both Services (Recommended)
```bash
# Start both AI API and AI Chat services concurrently
deno task dev:all
```

This will start:
- AI API service at `http://localhost:8000`
- AI Chat web app at `http://localhost:3000`

### Option 2: Start Services Individually

#### Start AI API Service Only
```bash
deno task dev:api
# or
cd internal/ai-api && deno task dev
```

#### Start AI Chat Service Only
```bash
deno task dev:chat
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

### Root Level
- `deno task dev:all` - Start both services concurrently
- `deno task dev:api` - Start only AI API service
- `deno task dev:chat` - Start only AI Chat service

### AI API Service (`internal/ai-api`)
- `deno task dev` - Development server with hot reload
- `deno task start` - Production server
- `deno task test` - Run unit tests
- `deno task test:e2e` - Run end-to-end tests

### AI Chat Service (`web/ai-chat`)
- `deno task dev` - Development server with hot reload
- `deno task dev:with-api` - Start with API dependency check
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
   deno task dev:api
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
   # Configure environment
   cp internal/ai-api/.env.example internal/ai-api/.env
   # Edit internal/ai-api/.env with your API keys
   
   # Start both services
   deno task dev:all
   ```

2. **Daily development:**
   ```bash
   # Start both services
   deno task dev:all
   
   # Open browser to http://localhost:3000
   ```

3. **Working on individual services:**
   ```bash
   # API only
   deno task dev:api
   
   # Chat only (requires API to be running)
   deno task dev:chat
   ```

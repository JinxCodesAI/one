# AI Chat v2

A modern AI chat application built with Vite, Deno, React, and TypeScript.
Features a clean interface for conversing with multiple AI models including
OpenAI GPT, Google Gemini, and Anthropic Claude. Uses the co-located BFF (Backend-For-Frontend) pattern for secure service integration.

## Features

- 🤖 Multiple AI model support (GPT-4, Gemini, Claude)
- 💬 Real-time chat interface
- 🔄 Model switching during conversation
- ⚡ Fast and responsive UI
- 🛡️ Type-safe with TypeScript
- 🧪 Comprehensive test suite
- 🔒 Secure co-located BFF architecture
- 🚀 Production-ready deployment

## Architecture

This application follows the co-located BFF pattern:

```
[Browser] → [Frontend (Vite)] → [Co-located BFF] → [AI API Service]
```

- **Frontend**: React app served by Vite dev server (development) or BFF (production)
- **BFF Server**: Hono-based server that proxies requests to internal services
- **AI API Service**: Internal service providing AI functionality

## Prerequisites

- Deno v2.0.0 or later
- AI API service running (see `internal/ai-api`)

## Development

### Quick Start

1. **Start the AI API service** (required):
   ```bash
   cd internal/ai-api
   deno task dev
   ```

2. **Start the AI Chat application**:
   ```bash
   cd web/ai-chat
   deno task dev
   ```

This starts both the BFF server (port 3000) and frontend dev server (port 5173).

### Available URLs

- **Frontend**: http://localhost:5173
- **BFF API**: http://localhost:3000/api/*
- **Health Check**: http://localhost:3000/health

### Development Tasks

```bash
# Start both BFF and frontend (recommended)
deno task dev

# Start only the frontend dev server
deno task dev:frontend

# Start only the BFF server
deno task dev:server

# Build for production
deno task build

# Serve production build
deno task serve

# Run tests
deno task test

# Run E2E tests
deno task test:e2e
```

## Production Deployment

Build and serve the application:

```bash
# Build the frontend
deno task build

# Start the production server (serves both static files and API)
deno task serve
```

The production server serves:
- Static files from `./dist`
- API endpoints at `/api/*`
- Health check at `/health`

## Testing

This project includes a comprehensive test suite following the Frontend Development Guide.

### Test Types

- **Unit Tests**: Test individual components and services
- **Integration Tests**: Test service integration through BFF
- **E2E Tests**: Test complete workflows including BFF connectivity

### Running Tests

```bash
# All tests
deno task test:all

# Unit tests only
deno task test:unit

# Integration tests
deno task test:integration

# E2E tests (requires BFF server running)
deno task test:e2e

# Watch mode for development
deno task test:watch
```

### E2E Testing Requirements

E2E tests verify:
1. BFF server connectivity
2. API endpoint functionality
3. Development workflow (Vite proxy)
4. Error handling

Start the BFF server before running E2E tests:

```bash
# Terminal 1: Start BFF server
deno task dev:server

# Terminal 2: Run E2E tests
deno task test:e2e
```

### Test Runner Script

For more advanced testing options:

```bash
# Run with coverage
deno run scripts/test-runner.ts --coverage

# Run specific test type with verbose output
deno run scripts/test-runner.ts --type unit --verbose

# Filter tests by name
deno run scripts/test-runner.ts --filter "MessageList"
```

### Test Architecture

- **Unit Tests**: Test individual components and services in isolation
- **Integration Tests**: Test interactions between hooks and services
- **E2E Tests**: Test complete user flows with real backend integration

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatContainer.tsx
│   ├── MessageList.tsx
│   ├── MessageInput.tsx
│   ├── ModelSelector.tsx
│   ├── ErrorMessage.tsx
│   └── __tests__/       # Component unit tests
├── hooks/               # Custom React hooks
│   ├── useChat.ts
│   └── __tests__/       # Hook integration tests
├── services/            # Service layer
│   ├── aiClient.ts
│   └── __tests__/       # Service unit tests
├── test-utils/          # Test utilities
└── types.ts             # TypeScript types

e2e/                     # End-to-end tests
├── utils/               # E2E test utilities
├── chat-flow.e2e.ts
└── frontend-integration.e2e.ts
```

## Configuration

The application connects to the AI API service at `http://localhost:8000` by
default. Make sure the AI API service is running before starting the
application.

## Available Scripts

- `deno task dev` - Start development server
- `deno task build` - Build for production
- `deno task preview` - Preview production build
- `deno task serve` - Serve static files
- `deno task test` - Run unit tests
- `deno task test:unit` - Run unit tests only
- `deno task test:integration` - Run integration tests
- `deno task test:e2e` - Run E2E tests
- `deno task test:all` - Run all tests
- `deno task test:watch` - Run tests in watch mode

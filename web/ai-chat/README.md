# AI Chat v2

A modern AI chat application built with Vite, Deno, React, and TypeScript. Features a clean interface for conversing with multiple AI models including OpenAI GPT, Google Gemini, and Anthropic Claude.

## Features

- 🤖 Multiple AI model support (GPT-4, Gemini, Claude)
- 💬 Real-time chat interface
- 🔄 Model switching during conversation
- ⚡ Fast and responsive UI
- 🛡️ Type-safe with TypeScript
- 🧪 Comprehensive test suite

## Prerequisites

- Deno v2.0.0 or later
- AI API service running (see `internal/ai-api`)

## Development

Start the development server:

```bash
deno task dev
```

The application will be available at `http://localhost:5173`

## Building

Build production assets:

```bash
deno task build
```

Serve production build:

```bash
deno task preview
```

## Testing

This project includes a comprehensive test suite with unit tests, integration tests, and end-to-end tests.

### Quick Start

```bash
# Run all tests
deno task test:all

# Run only unit tests
deno task test:unit

# Run integration tests
deno task test:integration

# Run E2E tests
deno task test:e2e

# Run tests in watch mode
deno task test:watch
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

The application connects to the AI API service at `http://localhost:8000` by default. Make sure the AI API service is running before starting the application.

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

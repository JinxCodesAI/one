# AI Chat Monorepo

A modern AI chat application built with Deno, featuring a React frontend and a
robust API backend that supports multiple AI providers.

> **🪟 Windows Users**: After installing `just`, you MUST run `just setup` (or
> `deno run --allow-read --allow-write scripts/setup-justfile.ts` if that fails)
> to configure the shell. This fixes "could not find the shell" errors.

## Architecture

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

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) 2.3.6+
- [just](https://github.com/casey/just) task runner

### Installation

#### Install `just` Task Runner

**Windows:**

```powershell
# Via Chocolatey (Recommended)
choco install just

# Via Scoop
scoop install just

# Via Cargo (if you have Rust installed)
cargo install just
```

**macOS:**

```bash
# Via Homebrew (Recommended)
brew install just

# Via Cargo
cargo install just
```

**Linux:**

```bash
# Via Cargo
cargo install just

# Via package manager (varies by distribution)
# Ubuntu/Debian: sudo apt install just
# Arch: sudo pacman -S just
```

#### Setup Project

```bash
# Clone and setup project
git clone <repository-url>
cd <repository-name>

# IMPORTANT: Configure justfile for your operating system
# Windows users MUST run this to avoid shell errors:
just setup

# If you get "could not find the shell" error on Windows, run this instead:
# deno run --allow-read --allow-write scripts/setup-justfile.ts

# Install project dependencies
just install
```

### Environment Setup

```bash
# Configure AI API environment
cp internal/ai-api/.env.example internal/ai-api/.env
# Edit internal/ai-api/.env with your API keys
```

You need at least one AI provider API key:

- **OpenAI**: Set `OPENAI_API_KEY`
- **Google AI**: Set `GOOGLE_GENERATIVE_AI_API_KEY`
- **OpenRouter**: Set `OPENROUTER_API_KEY`

### Development Commands

```bash
# Setup (run once)
just setup            # Configure justfile for your OS (required for Windows)

# Native Development (Recommended - Faster)
just dev-all          # Start both services concurrently using proc-runner
just dev-api          # Start AI API server only (for debugging)
just dev-chat         # Start AI Chat app only (for debugging)

# Docker Development (Optional - Environment Consistency)
just docker-dev       # Start all services with Docker Compose
just docker-stop      # Stop Docker services
just docker-logs      # View Docker logs
just docker-clean     # Clean Docker resources
```

### Production Commands

```bash
# Native Production (use individual project commands)
cd web/ai-chat && deno task build     # Build AI Chat for production
cd internal/ai-api && deno task start # Start AI API in production mode
cd web/ai-chat && deno task preview   # Start AI Chat in production mode

# Docker Production
just docker-prod      # Start all services with Docker Compose (production)
```

## Project Structure

```
.
├── internal/
│   └── ai-api/              # Backend API service
│       ├── config/          # Configuration management
│       ├── core/            # Core AI service logic
│       ├── server/          # HTTP server implementation
│       ├── sdk/             # Client SDK
│       └── e2e/             # End-to-end tests
├── web/
│   └── ai-chat/             # Frontend React application
│       ├── src/             # Source code
│       ├── e2e/             # UI E2E tests
│       └── dist/            # Build output
├── packages/
│   └── testing-infrastructure/  # Shared testing utilities
└── docs/                    # Documentation
```

## Development Workflow

1. **First time setup:**
   ```bash
   # Configure justfile for your OS (REQUIRED for Windows)
   just setup

   # If you get shell errors on Windows, run this instead:
   # deno run --allow-read --allow-write scripts/setup-justfile.ts

   # Install dependencies and configure environment
   just install
   cp internal/ai-api/.env.example internal/ai-api/.env
   # Edit internal/ai-api/.env with your API keys
   ```

2. **Daily development:**
   ```bash
   # Native development (recommended - faster)
   just dev-all

   # OR Docker development (optional - environment consistency)
   just docker-dev

   # Open browser to http://localhost:3000
   ```

3. **Testing:**
   ```bash
   # Run tests for individual projects
   cd internal/ai-api && deno task test
   cd web/ai-chat && deno task test

   # Run E2E tests
   cd internal/ai-api && deno task test:e2e
   cd web/ai-chat && deno task test:e2e
   ```

## Available Services

### AI API Service (Port 8000)

- RESTful API for AI text generation
- Support for multiple AI providers
- Model management and health checks
- Comprehensive error handling

### AI Chat Web App (Port 3000)

- Modern React-based chat interface
- Real-time model switching
- Message history management
- Responsive design

## Development Options

### Native Development (Recommended)

- **Faster**: Direct Deno execution without container overhead
- **Hot Reload**: Instant file change detection
- **Resource Efficient**: Lower memory and CPU usage
- **Debugging**: Easier debugging with native tools

### Docker Development (Optional)

- **Environment Consistency**: Identical dev/prod environments
- **Easy Onboarding**: New developers just run `just docker-dev`
- **Isolation**: No conflicts with local development tools
- **External Dependencies**: Easy to add databases, Redis, etc.

**When to use Docker:**

- New team members (easier setup)
- Testing production-like environment
- Need external dependencies (databases, caching)
- Debugging environment-specific issues

See
[Docker Compose Strategy ADR](docs/development/ADRs/Docker_Compose_Strategy.md)
for detailed implementation.

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

### Command Not Found: `just`

Make sure `just` is installed and in your PATH. See installation instructions
above.

### Windows-Specific Issues

#### "Could not find `cygpath` executable" or "could not find the shell" Error

These errors occur when `just` can't find the appropriate shell on Windows.

**Solution 1 (Recommended)**:

```powershell
just setup
```

**Solution 2 (If just setup fails)**:

```powershell
deno run --allow-read --allow-write scripts/setup-justfile.ts
```

This configures the `justfile` to use PowerShell on Windows and sh on Unix
systems.

#### PowerShell Execution Policy Issues

If you get execution policy errors:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy to allow local scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Chocolatey Permission Issues

If you see "Access to the path 'C:\ProgramData\chocolatey\lib-bad' is denied":

```powershell
# Run PowerShell as Administrator and try again
choco install just

# Or use Scoop instead (doesn't require admin)
scoop install just
```

## Contributing

1. Run tests before committing: `cd <project> && deno task test`
2. Format code: `cd <project> && deno fmt`
3. Lint code: `cd <project> && deno lint`
4. Use the shared testing infrastructure for new tests
5. Primary development workflow: `just dev-all`

## Documentation

- [Development Guide](DEVELOPMENT.md) - Detailed development instructions
- [Testing Guide](TESTING.md) - Testing strategies and best practices
- [Technical Documentation](docs/) - Architecture and implementation details

## License

[Add your license information here]

# Educational Monorepo - Services & POC Applications

An educational monorepo demonstrating modern web development patterns with Deno, featuring reusable services and proof-of-concept applications that showcase different architectural approaches and technologies.

> **🪟 Windows Users**: After installing `just`, you MUST run `just setup` (or
> `deno run --allow-read --allow-write scripts/setup-justfile.ts` if that fails)
> to configure the shell. This fixes "could not find the shell" errors.

## Purpose & Educational Goals

This monorepo serves as a learning platform for:
- **Microservices Architecture**: Building and consuming independent services
- **Modern Web Development**: React, TypeScript, and Deno ecosystem
- **API Design**: RESTful services with SDK-first approach
- **Testing Strategies**: Unit, integration, and E2E testing patterns
- **DevOps Practices**: Docker, CI/CD, and development workflows
- **Code Organization**: Monorepo management and shared tooling

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Educational Monorepo                     │
├─────────────────────────────────────────────────────────────┤
│  Services (/internal)          │  POC Applications (/web)   │
│                                 │                           │
│  ┌─────────────────┐           │  ┌─────────────────┐      │
│  │   AI API        │           │  │   AI Chat       │      │
│  │   (Port 8000)   │◄──────────┤  │   (Port 3000)   │      │
│  │                 │    HTTP   │  │                 │      │
│  │ - OpenAI        │           │  │ - React UI      │      │
│  │ - Google AI     │           │  │ - Chat Interface│      │
│  │ - OpenRouter    │           │  │ - Model Selector│      │
│  └─────────────────┘           │  └─────────────────┘      │
│                                 │                           │
│  ┌─────────────────┐           │  ┌─────────────────┐      │
│  │ Profile Service │           │  │   Todo App      │      │
│  │   (Port 8001)   │◄──────────┤  │   (Port 3001)   │      │
│  │                 │    HTTP   │  │                 │      │
│  │ - User Profiles │           │  │ - Task Management│      │
│  │ - SQLite DB     │           │  │ - React UI      │      │
│  │ - File Storage  │           │  │ - Profile Integration│  │
│  └─────────────────┘           │  └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
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
# Configure AI API environment (required for AI Chat app)
cp internal/ai-api/.env.example internal/ai-api/.env
# Edit internal/ai-api/.env with your API keys

# Profile Service runs without additional configuration
# (uses SQLite database that's created automatically)
```

For AI functionality, you need at least one AI provider API key:

- **OpenAI**: Set `OPENAI_API_KEY`
- **Google AI**: Set `GOOGLE_GENERATIVE_AI_API_KEY`
- **OpenRouter**: Set `OPENROUTER_API_KEY`

### Development Commands

```bash
# Setup (run once)
just setup            # Configure justfile for your OS (required for Windows)

# Native Development (Recommended - Faster)
just dev-api          # Start AI API server
just dev-chat         # Start AI Chat app
just dev-all          # Start both services concurrently

# Docker Development (Optional - Environment Consistency)
just docker-dev       # Start all services with Docker Compose
just docker-stop      # Stop Docker services
just docker-logs      # View Docker logs
just docker-clean     # Clean Docker resources

# Testing
just test             # Run all tests
just test-unit        # Run unit tests only
just test-e2e         # Run E2E tests only

# Code Quality
just lint             # Lint all projects
just fmt              # Format all projects
just clean            # Clean build artifacts
just check            # Run lint + test
```

### Production Commands

```bash
# Native Production
just build-chat       # Build AI Chat for production
just start-api        # Start AI API in production mode
just start-chat       # Start AI Chat in production mode

# Docker Production
just docker-prod      # Start all services with Docker Compose (production)
```

## Project Structure

```
.
├── internal/                    # Reusable Services
│   ├── ai-api/                 # AI Text Generation Service
│   │   ├── config/             # Configuration management
│   │   ├── core/               # Core AI service logic
│   │   ├── server/             # HTTP server implementation
│   │   ├── sdk/                # Client SDK for easy integration
│   │   └── e2e/                # End-to-end tests
│   └── profile-service/        # User Profile Management Service
│       ├── database/           # SQLite database and migrations
│       ├── server/             # HTTP server implementation
│       ├── sdk/                # Client SDK for easy integration
│       └── static/             # Static file serving
├── web/                        # POC Applications (Educational Examples)
│   ├── ai-chat/               # AI Chat Application
│   │   ├── src/               # React source code
│   │   ├── e2e/               # UI E2E tests
│   │   └── dist/              # Build output
│   └── todo-app/              # Todo Management Application
│       ├── src/               # React source code
│       ├── e2e/               # UI E2E tests
│       └── dist/              # Build output
├── packages/
│   └── testing-infrastructure/ # Shared testing utilities
├── docs/                       # Documentation and ADRs
└── cli/                        # Command-line tools and scripts
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
   # Run all tests
   just test

   # Run specific test types
   just test-unit
   just test-e2e
   ```

## Available Services & Applications

### Services (/internal)

#### AI API Service (Port 8000)
- **Purpose**: Centralized AI text generation service
- **Features**:
  - RESTful API for AI text generation
  - Support for multiple AI providers (OpenAI, Google AI, OpenRouter)
  - Model management and health checks
  - Comprehensive error handling
  - SDK for easy integration
- **Educational Focus**: API design, provider abstraction, error handling

#### Profile Service (Port 8001)
- **Purpose**: User profile management and file storage
- **Features**:
  - User profile CRUD operations
  - SQLite database with migrations
  - File upload and storage
  - RESTful API with comprehensive validation
  - SDK for easy integration
- **Educational Focus**: Database design, file handling, data validation

### POC Applications (/web)

#### AI Chat Application (Port 3000)
- **Purpose**: Demonstrate AI service integration in a chat interface
- **Features**:
  - Modern React-based chat interface
  - Real-time model switching
  - Message history management
  - Responsive design
- **Educational Focus**: React patterns, API consumption, real-time UI

#### Todo Application (Port 3001)
- **Purpose**: Showcase profile service integration with task management
- **Features**:
  - Task management with user profiles
  - Profile integration for personalization
  - Modern React UI with state management
  - Responsive design
- **Educational Focus**: Service composition, state management, user experience

## Educational Learning Paths

### For Backend Developers
1. **Start with Services**: Explore `/internal/ai-api` and `/internal/profile-service`
   - Learn service architecture patterns
   - Understand API design principles
   - Practice SDK development
   - Study error handling and validation

2. **Database & Storage**: Focus on `/internal/profile-service`
   - SQLite integration and migrations
   - File upload and storage patterns
   - Data validation and sanitization

### For Frontend Developers
1. **Start with Applications**: Explore `/web/ai-chat` and `/web/todo-app`
   - Modern React patterns and hooks
   - API integration strategies
   - State management approaches
   - Responsive design principles

2. **Service Integration**: Learn how applications consume services
   - SDK usage patterns (recommended approach)
   - Direct REST API calls (alternative approach)
   - Error handling in UI
   - Loading states and user feedback

### For Full-Stack Learning
1. **Follow the Data Flow**: Trace requests from UI → Service → Database
2. **Build New Features**: Add endpoints to services and consume them in apps
3. **Create New Applications**: Build additional POC apps using existing services
4. **Extend Services**: Add new functionality to existing services

### For DevOps & Tooling
1. **Development Workflow**: Study the `justfile` and development commands
2. **Testing Strategy**: Explore unit, integration, and E2E test patterns
3. **Docker Setup**: Understand containerization for development and production
4. **Monorepo Management**: Learn shared tooling and dependency management

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

## Contributing & Learning

This is an educational project designed for learning and experimentation. Contributions that enhance the learning experience are welcome!

### Code Quality Standards
1. Run tests before committing: `just test`
2. Format code: `just fmt`
3. Lint code: `just lint`
4. Use the shared testing infrastructure for new tests

### Educational Contributions
- **New POC Applications**: Create additional apps in `/web/` that demonstrate different patterns
- **Service Extensions**: Add new features to existing services with proper documentation
- **New Services**: Add new services in `/internal/` that other applications can consume
- **Documentation**: Improve guides, add tutorials, or document architectural decisions
- **Testing Examples**: Add comprehensive test examples that others can learn from

### Learning-Focused Guidelines
- **Document Your Approach**: Explain why you chose specific patterns or technologies
- **Add Comments**: Help others understand complex logic or architectural decisions
- **Create Examples**: Show multiple ways to solve the same problem
- **Write Tests**: Demonstrate testing strategies and best practices

## Future Expansion Plans

This monorepo is designed to grow with additional services and applications:

### Planned Services (/internal)
- **Authentication Service**: JWT-based auth with role management
- **Notification Service**: Email, SMS, and push notification handling
- **Analytics Service**: Event tracking and reporting
- **File Processing Service**: Image/document processing and transformation

### Planned Applications (/web)
- **Admin Dashboard**: Service management and monitoring interface
- **E-commerce POC**: Shopping cart with profile and payment integration
- **Social Media POC**: User interactions with notification service
- **Analytics Dashboard**: Data visualization using analytics service

### Educational Expansions
- **Mobile Applications**: React Native or Flutter examples
- **Desktop Applications**: Electron or Tauri implementations
- **CLI Tools**: Command-line interfaces for service interaction
- **Microservice Patterns**: Event-driven architecture examples

## Documentation

- [Development Guide](DEVELOPMENT.md) - Detailed development instructions
- [Testing Guide](TESTING.md) - Testing strategies and best practices
- [Technical Documentation](docs/) - Architecture and implementation details

## License

[Add your license information here]

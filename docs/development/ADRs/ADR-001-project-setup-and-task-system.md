# ADR-001: Project Setup and Task System Architecture

**Status:** Accepted  
**Date:** 2025-06-21  
**Authors:** Development Team  
**Supersedes:** N/A  

## Context

This ADR documents the standardized approach for setting up new projects within our Deno monorepo and the task system architecture that enables scalable project management. This system was designed to support multiple independent services while maintaining centralized orchestration and shared tooling.

## Decision

We adopt a **decentralized configuration with centralized orchestration** approach using:

1. **Deno Workspaces** for project organization
2. **Project-specific `deno.json` files** for isolation
3. **Just task runner** for orchestration
4. **Shared testing infrastructure** for consistency

## Architecture Overview

### Directory Structure

```
/
├── deno.json                           # Root workspace configuration
├── justfile                           # Task orchestration
├── internal/                          # Internal services
│   └── [service-name]/
│       ├── deno.json                  # Service-specific config
│       ├── main.ts                    # Entry point
│       ├── src/                       # Source code
│       ├── tests/                     # Unit tests
│       └── e2e/                       # E2E tests
├── web/                               # Web applications
│   └── [app-name]/
│       ├── deno.json                  # App-specific config
│       ├── main.ts                    # Entry point
│       ├── src/                       # Source code
│       └── e2e/                       # E2E tests
└── packages/                          # Shared packages
    └── [package-name]/
        ├── deno.json                  # Package-specific config
        ├── src/                       # Source code
        └── mod.ts                     # Main export
```

### Configuration Files

#### Root `deno.json`

```json
{
  "workspace": [
    "./internal/[service-name]",
    "./web/[app-name]", 
    "./packages/[package-name]"
  ],
  "tasks": {
    "test": "deno task --cwd internal/[service] test && deno task --cwd web/[app] test && deno task --cwd packages/[package] test",
    "lint": "deno lint internal/[service] && deno lint web/[app] && deno lint packages/[package]"
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@1",
    "@one/[shared-package]": "./packages/[shared-package]/src/mod.ts"
  }
}
```

#### Project-specific `deno.json`

```json
{
  "imports": {
    "dependency": "npm:dependency@version",
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing": "jsr:@std/testing@1"
  },
  "tasks": {
    "dev": "deno run --allow-all --watch main.ts",
    "start": "deno run --allow-all main.ts", 
    "test": "deno test --allow-env --allow-net",
    "test:e2e": "deno test --allow-all e2e/**/*.e2e.ts"
  },
  "compilerOptions": {
    "lib": ["deno.ns", "es2022"]
  }
}
```

## Setting Up New Projects

### 1. Internal Services

For backend services (APIs, microservices):

```bash
# Create directory structure
mkdir -p internal/[service-name]/{src,tests,e2e}

# Create deno.json
cat > internal/[service-name]/deno.json << 'EOF'
{
  "imports": {
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing": "jsr:@std/testing@1",
    "@std/dotenv": "jsr:@std/dotenv@0.225"
  },
  "tasks": {
    "dev": "deno run --allow-all --watch main.ts",
    "start": "deno run --allow-all main.ts",
    "test": "deno test --allow-env --allow-net",
    "test:e2e": "deno test --allow-all e2e/**/*.e2e.ts"
  }
}
EOF

# Create main.ts
cat > internal/[service-name]/main.ts << 'EOF'
/**
 * [Service Name] - Main entry point
 */

export async function startServer(): Promise<void> {
  console.log('[Service Name] starting...');
  // Implementation here
}

// Start server when run directly
if (import.meta.main) {
  await startServer();
}
EOF
```

### 2. Web Applications

For frontend applications:

```bash
# Create directory structure  
mkdir -p web/[app-name]/{src,e2e}

# Create deno.json with DOM support
cat > web/[app-name]/deno.json << 'EOF'
{
  "imports": {
    "react": "npm:react@^19.0.0",
    "react-dom": "npm:react-dom@^19.0.0",
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing": "jsr:@std/testing@1"
  },
  "tasks": {
    "dev": "deno run --allow-all --watch main.ts",
    "start": "deno run --allow-all main.ts",
    "test": "deno test --allow-env --allow-net --no-check",
    "test:e2e": "deno test --allow-all e2e/**/*.e2e.ts"
  },
  "compilerOptions": {
    "lib": ["deno.ns", "es2022", "dom"]
  }
}
EOF
```

### 3. Shared Packages

For reusable libraries:

```bash
# Create directory structure
mkdir -p packages/[package-name]/src

# Create deno.json
cat > packages/[package-name]/deno.json << 'EOF'
{
  "imports": {
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing": "jsr:@std/testing@1"
  },
  "tasks": {
    "test": "deno test --allow-env --allow-net"
  }
}
EOF

# Create mod.ts (main export)
cat > packages/[package-name]/src/mod.ts << 'EOF'
/**
 * [Package Name] - Main exports
 */

export * from './[main-module].ts';
EOF
```

## Task System Integration

### Update Root Workspace

1. **Add to workspace array** in root `deno.json`:
```json
{
  "workspace": [
    "./internal/[new-service]"
  ]
}
```

2. **Update task commands** to include new project:
```json
{
  "tasks": {
    "test": "deno task --cwd internal/[service] test && deno task --cwd internal/[new-service] test",
    "lint": "deno lint internal/[service] && deno lint internal/[new-service]"
  }
}
```

### Update Justfile

Add project-specific tasks:

```just
# --- Development Tasks ---
dev-[service]:
    @echo "🚀 Starting [Service] development server..."
    @cd internal/[service] && deno task dev

# --- E2E Testing ---  
test-e2e-[service]:
    @echo "🌐 Running [Service] E2E tests..."
    @cd internal/[service] && deno task test:e2e
```

## Dependency Management

### Project Dependencies

- **Add to project-specific `deno.json`** imports section
- **Use specific versions** for stability
- **Prefer JSR packages** over npm when available

### Shared Dependencies

- **Add to root `deno.json`** imports for workspace-wide access
- **Use path mapping** for internal packages: `"@one/package": "./packages/package/src/mod.ts"`

### Example Dependency Patterns

```json
{
  "imports": {
    // External dependencies
    "express": "npm:express@4.18.2",
    "react": "npm:react@^19.0.0",
    
    // Deno standard library
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing": "jsr:@std/testing@1",
    
    // Internal packages
    "@one/testing-infrastructure": "./packages/testing-infrastructure/src/mod.ts",
    "@one/shared-types": "./packages/shared-types/src/mod.ts"
  }
}
```

## Testing Strategy

### Unit Tests

- **Location**: `tests/` or `src/**/*.test.ts`
- **Command**: `deno task test`
- **Scope**: Individual functions and modules

### E2E Tests

- **Location**: `e2e/` directory
- **Naming**: `*.e2e.ts` files
- **Command**: `deno task test:e2e`
- **Scope**: Full application workflows

### Shared Testing Infrastructure

Use `@one/testing-infrastructure` for:
- Mock utilities
- Test fixtures
- Common assertions
- E2E helpers

## Service Dependencies

### Web App → API Service

For web applications that depend on API services:

1. **Environment Configuration**:
```typescript
// In web app
function getAPIUrl(): string {
  return Deno?.env?.get('API_URL') || 'http://localhost:8000';
}
```

2. **E2E Test Setup**:
```typescript
// Start API service before web app E2E tests
import { startServer } from '../../internal/api-service/main.ts';

// In E2E test setup
const apiServer = await startServer();
// Run web app tests
await apiServer.stop();
```

### Service → Service Communication

For internal service communication:
- Use HTTP APIs with proper error handling
- Define shared types in `packages/shared-types`
- Use service discovery patterns for production

## Best Practices

### 1. Project Isolation
- Each project has its own `deno.json`
- Dependencies are scoped to projects that need them
- No cross-project imports except through shared packages

### 2. Consistent Structure
- Follow the established directory patterns
- Use standard task names (`dev`, `start`, `test`, `test:e2e`)
- Maintain consistent naming conventions

### 3. Dependency Management
- Pin versions for stability
- Use workspace imports for shared packages
- Minimize duplicate dependencies

### 4. Testing
- Write unit tests for all new code
- Add E2E tests for user-facing features
- Use shared testing infrastructure

### 5. Documentation
- Document API endpoints and interfaces
- Update this ADR when patterns change
- Include setup instructions in project READMEs

## Migration Guide

When adding existing projects to this system:

1. **Create project-specific `deno.json`**
2. **Move dependencies** from root to project level
3. **Add to workspace** array in root `deno.json`
4. **Update justfile** with project tasks
5. **Test all commands** work correctly

## Future Considerations

- **Container orchestration** for production deployments
- **Shared configuration** management
- **Cross-project type checking** improvements
- **Automated dependency updates**

---

This ADR establishes the foundation for scalable project management in our Deno monorepo. All new projects should follow these patterns to ensure consistency and maintainability.

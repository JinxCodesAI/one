# ADR: Adding New Projects to the Monorepo

**Status**: Active  
**Date**: 2025-06-21  
**Authors**: Development Team  
**Reviewers**: Architecture Team  

## Context

With the implementation of the `just`-based task system, we need clear guidelines for adding new projects to the monorepo. This ADR provides a comprehensive step-by-step process to ensure consistency, maintainability, and proper integration with our existing infrastructure.

## Decision

We will follow a standardized process for adding new projects that integrates with our `justfile`-based task orchestration, workspace configuration, and testing infrastructure.

## Implementation Guide

### Step 1: Project Structure Setup

#### 1.1 Choose Project Location
```bash
# For internal services (APIs, microservices)
internal/<project-name>/

# For web applications (frontends, web services)  
web/<project-name>/

# For shared packages/libraries
packages/<project-name>/
```

#### 1.2 Create Project Directory Structure
```bash
mkdir -p <project-location>/<project-name>
cd <project-location>/<project-name>

# Standard structure
mkdir -p {src,tests,e2e,docs}
touch deno.json main.ts README.md .env.example
```

### Step 2: Configure Project-Level `deno.json`

Create `<project-name>/deno.json` with standard configuration:

```json
{
  "name": "@scope/<project-name>",
  "version": "0.0.1",
  "tasks": {
    "dev": "deno run --allow-net --allow-env --allow-read --watch main.ts",
    "start": "deno run --allow-net --allow-env --allow-read main.ts",
    "test": "deno test --allow-net --allow-env --allow-read --allow-write src/",
    "test:unit": "deno test --allow-net --allow-env --allow-read --allow-write --ignore='src/**/*.integration.ts' --ignore='src/**/*.e2e.ts' src/",
    "test:integration": "deno test --allow-net --allow-env --allow-read --allow-write src/**/*.integration.ts",
    "test:e2e": "deno test --allow-net --allow-env --allow-read --allow-write --allow-run --allow-sys e2e/**/*.e2e.ts",
    "test:watch": "deno test --allow-net --allow-env --allow-read --allow-write --watch src/",
    "test:all": "deno test --allow-net --allow-env --allow-read --allow-write"
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing/bdd": "jsr:@std/testing@1/bdd",
    "@one/testing-infrastructure": "../packages/testing-infrastructure/src/mod.ts"
  },
  "exports": {
    ".": "./main.ts"
  },
  "compilerOptions": {
    "lib": ["deno.ns", "es2022", "dom"]
  }
}
```

### Step 3: Update Root Workspace Configuration

#### 3.1 Add to Root `deno.json` Workspace
```json
{
  "workspace": [
    "./internal/ai-api",
    "./web/ai-chat", 
    "./packages/testing-infrastructure",
    "./<project-location>/<project-name>"
  ]
}
```

#### 3.2 Add Shared Dependencies (if needed)
Only add to root `imports` if the dependency is used by multiple projects:

```json
{
  "imports": {
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing/bdd": "jsr:@std/testing@1/bdd",
    "ai": "npm:ai@^4.3.16",
    "playwright": "npm:playwright@^1.40.0",
    "@one/testing-infrastructure": "./packages/testing-infrastructure/src/mod.ts",
    "@one/<project-name>": "./<project-location>/<project-name>/main.ts"
  }
}
```

### Step 4: Update `justfile` Task Orchestration

#### 4.1 Add Development Commands
```makefile
# Add to justfile
dev-<project-name>:
    @echo "🚀 Starting <Project Name>..."
    @deno task --cwd <project-location>/<project-name> dev
```

**Note**: Use `@echo` and simple commands for cross-platform compatibility. Avoid bash-specific syntax to ensure Windows compatibility.

#### 4.2 Add Testing Commands
```makefile
# Update existing test commands
test-unit:
    @echo "🔬 Running unit tests..."
    @echo "Testing AI API..."
    @deno task --cwd internal/ai-api test
    @echo "Testing AI Chat..."
    @deno task --cwd web/ai-chat test
    @echo "Testing <Project Name>..."
    @deno task --cwd <project-location>/<project-name> test
    @echo "Testing infrastructure..."
    @deno task --cwd packages/testing-infrastructure test || echo "ℹ️ No tests found in testing-infrastructure (expected)"

test-e2e:
    @echo "🌐 Running E2E tests..."
    @deno task --cwd internal/ai-api test:e2e
    @deno task --cwd web/ai-chat test:e2e
    @deno task --cwd <project-location>/<project-name> test:e2e

test-<project-name>:
    @echo "🔧 Testing <Project Name> (unit + E2E)..."
    @deno task --cwd <project-location>/<project-name> test
    @deno task --cwd <project-location>/<project-name> test:e2e
```

#### 4.3 Add Linting and Formatting
```makefile
# Update existing commands
lint:
    @echo "🔍 Linting all projects..."
    @deno lint internal/ai-api/
    @deno lint web/ai-chat/
    @deno lint packages/testing-infrastructure/
    @deno lint <project-location>/<project-name>/

fmt:
    @echo "✨ Formatting all projects..."
    @deno fmt internal/ai-api/
    @deno fmt web/ai-chat/
    @deno fmt packages/testing-infrastructure/
    @deno fmt <project-location>/<project-name>/
```

### Step 5: Testing Infrastructure Integration

#### 5.1 Use Shared Testing Infrastructure
```typescript
// In your test files
import { 
  setupServerTestEnvironment,
  setupUITestEnvironment,
  FetchMockManager 
} from "@one/testing-infrastructure";
```

#### 5.2 Create E2E Tests
```typescript
// e2e/basic.e2e.ts
import { describe, it, before, after } from "@std/testing/bdd";
import { assert } from "@std/assert";
import { setupServerTestEnvironment } from "@one/testing-infrastructure";

describe("<Project Name> E2E Tests", () => {
  let cleanup: () => Promise<void>;

  before(async () => {
    const { cleanup: cleanupFn } = await setupServerTestEnvironment({
      port: 8080, // Use different port for each service
      providers: ['openai'] // If AI integration needed
    });
    cleanup = cleanupFn;
  });

  after(async () => {
    await cleanup();
  });

  it("should respond to health check", async () => {
    const response = await fetch("http://localhost:8080/health");
    assert(response.ok);
  });
});
```

### Step 6: Documentation Updates

#### 6.1 Update Root README.md
Add project description to the project structure section:

```markdown
## Project Structure

```
.
├── internal/
│   ├── ai-api/              # Backend API service
│   └── <project-name>/      # [Description of new project]
├── web/
│   ├── ai-chat/             # Frontend React application  
│   └── <project-name>/      # [Description of new project]
├── packages/
│   ├── testing-infrastructure/  # Shared testing utilities
│   └── <project-name>/      # [Description of new project]
```
```

#### 6.2 Update DEVELOPMENT.md
Add development commands:

```markdown
### Development Commands
- `just dev-all` - Start all services concurrently
- `just dev-api` - Start only AI API service
- `just dev-chat` - Start only AI Chat service
- `just dev-<project-name>` - Start only <Project Name> service
```

#### 6.3 Update TESTING.md
Add testing information:

```markdown
### Run Tests for Specific Projects
```bash
# <Project Name> (unit + E2E)
just test-<project-name>
```
```

### Step 7: Environment Configuration

#### 7.1 Create `.env.example`
```bash
# <Project Name> Configuration

# Server Configuration
PORT=8080  # Use unique port
HOST=0.0.0.0

# Add project-specific environment variables
# API_KEY=your-api-key-here
# DATABASE_URL=your-database-url-here
```

#### 7.2 Update Root `.gitignore` (if needed)
```gitignore
# Add project-specific ignores
<project-location>/<project-name>/.env
<project-location>/<project-name>/dist/
<project-location>/<project-name>/build/
```

### Step 8: Validation Checklist

After adding a new project, verify:

- [ ] `just --list` shows new project commands
- [ ] `just dev-<project-name>` starts the project
- [ ] `just test-<project-name>` runs project tests
- [ ] `just test-unit` includes new project
- [ ] `just test-e2e` includes new project E2E tests
- [ ] `just lint` lints new project
- [ ] `just fmt` formats new project
- [ ] Workspace imports work correctly
- [ ] Documentation is updated
- [ ] E2E tests use shared infrastructure
- [ ] Project follows naming conventions

## Consequences

### Positive
- **Consistency**: All projects follow the same structure and conventions
- **Maintainability**: Clear process reduces configuration drift
- **Integration**: Automatic integration with existing tooling
- **Testing**: Shared testing infrastructure reduces duplication
- **Documentation**: Systematic documentation updates

### Negative
- **Initial Setup**: Requires following multiple steps
- **Maintenance**: Need to keep this ADR updated as tooling evolves

## Examples

See existing projects for reference:
- **API Service**: `internal/ai-api/`
- **Web Application**: `web/ai-chat/`
- **Shared Package**: `packages/testing-infrastructure/`

## Related Documents

- [Monorepo Task System Refactor](../technical-debt/originl-task-system-refactor.md)
- [Testing Guide](./Testing_Guide_Comprehensive.md)
- [AI API Specification](../ai-api/spec_stage_2.md)

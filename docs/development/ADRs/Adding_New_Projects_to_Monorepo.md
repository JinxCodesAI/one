# ADR: Adding New Projects to the Monorepo

**Status**: Active\
**Date**: 2025-06-21\
**Authors**: Development Team\
**Reviewers**: Architecture Team

## Context

With the implementation of the `proc-runner`-based service orchestration system, we need clear
guidelines for adding new projects to the monorepo. This ADR provides a
comprehensive step-by-step process to ensure consistency, maintainability, and
proper integration with our existing infrastructure.

## Decision

We will follow a standardized process for adding new projects that integrates
with our `proc-runner`-based service orchestration, workspace configuration, and
testing infrastructure.

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

### Step 4: Update Service Orchestration

#### 4.1 Add to `proc.jsonc` Configuration

Add your new service to the root `proc.jsonc` file:

```jsonc
{
  "$schema": "https://deno.land/x/proc_runner@v2.5.1/schema.json",
  "procs": {
    "ai-api": {
      "cmd": ["deno", "task", "dev"],
      "cwd": "internal/ai-api",
      "desc": "The main Deno-based AI backend API."
    },
    "ai-chat": {
      "cmd": ["deno", "task", "dev"],
      "cwd": "web/ai-chat",
      "desc": "The Vite-based React frontend.",
      "runAfter": ["ai-api"]
    },
    "<project-name>": {
      "cmd": ["deno", "task", "dev"],
      "cwd": "<project-location>/<project-name>",
      "desc": "Description of your new project.",
      "runAfter": ["ai-api"] // Optional: specify dependencies
    }
  }
}
```

#### 4.2 Add Individual Development Command to `justfile` (Optional)

The main orchestration is handled by `proc-runner`, but you can optionally add individual commands:

```makefile
# Add to justfile (optional - for individual service development)
dev-<project-name>:
    @echo "🚀 Starting <Project Name>..."
    @deno task --cwd <project-location>/<project-name> dev
```

**Note**: The primary development workflow uses `just dev-all` which automatically starts all services via `proc-runner`. Individual service commands are mainly for debugging or isolated development.

### Step 5: Testing Infrastructure Integration

#### 5.1 Use Shared Testing Infrastructure

```typescript
// In your test files
import {
  FetchMockManager,
  setupServerTestEnvironment,
  setupUITestEnvironment,
} from "@one/testing-infrastructure";
```

#### 5.2 Create E2E Tests

```typescript
// e2e/basic.e2e.ts
import { after, before, describe, it } from "@std/testing/bdd";
import { assert } from "@std/assert";
import { setupServerTestEnvironment } from "@one/testing-infrastructure";

describe("<Project Name> E2E Tests", () => {
  let cleanup: () => Promise<void>;

  before(async () => {
    const { cleanup: cleanupFn } = await setupServerTestEnvironment({
      port: 8080, // Use different port for each service
      providers: ["openai"], // If AI integration needed
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

. ├── internal/ │ ├── ai-api/ # Backend API service │ └── <project-name>/ #
[Description of new project] ├── web/ │ ├── ai-chat/ # Frontend React
application\
│ └── <project-name>/ # [Description of new project] ├── packages/ │ ├──
testing-infrastructure/ # Shared testing utilities │ └── <project-name>/ #
[Description of new project]

```
```

#### 6.2 Update DEVELOPMENT.md

Add development commands:

```markdown
### Development Commands

- `just dev-all` - Start all services concurrently using proc-runner (primary command)
- `just dev-api` - Start only AI API service (for debugging)
- `just dev-chat` - Start only AI Chat service (for debugging)

**Note**: The `dev-all` command uses `proc-runner` to orchestrate all services
defined in `proc.jsonc`, automatically handling dependencies and startup order.
Individual service commands are mainly for debugging purposes.
```

#### 6.3 Update TESTING.md

Add testing information:

````markdown
### Run Tests for Specific Projects

```bash
# <Project Name> (unit + E2E)
cd <project-location>/<project-name> && deno task test
cd <project-location>/<project-name> && deno task test:e2e
```
````

````
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
````

#### 7.2 Update Root `.gitignore` (if needed)

```gitignore
# Add project-specific ignores
<project-location>/<project-name>/.env
<project-location>/<project-name>/dist/
<project-location>/<project-name>/build/
```

### Step 8: Validation Checklist

After adding a new project, verify:

- [ ] `just dev-all` includes new project in orchestration
- [ ] Project is properly configured in `proc.jsonc`
- [ ] Service dependencies are correctly specified in `proc.jsonc`
- [ ] Individual `just dev-<project-name>` works (if added)
- [ ] Project tests run correctly with `deno task test`
- [ ] Workspace imports work correctly
- [ ] Documentation is updated
- [ ] E2E tests use shared infrastructure
- [ ] Project follows naming conventions

**Note**: With `proc-runner`, the primary verification is that `just dev-all` properly starts your service along with its dependencies. Individual testing, linting, and formatting are handled at the project level using `deno task` commands.

## Consequences

### Positive

- **Consistency**: All projects follow the same structure and conventions
- **Maintainability**: Clear process reduces configuration drift
- **Integration**: Automatic integration with existing tooling
- **Service Orchestration**: `proc-runner` provides reliable dependency management
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

- [Introducing proc-runner](../technical-debt/introducing-proc-runner.md)
- [Testing Guide](./Testing_Guide_Comprehensive.md)
- [AI API Specification](../ai-api/spec_stage_2.md)

# Monorepo Build & Task System: Refactoring Implementation Plan

**Document Version:** 2.0 **Date:** June 21, 2025 **Status:** IMPLEMENTATION
REQUIRED

---

## 1. Problem Statement & Goals

The current monorepo task system has several issues that need to be addressed:

### 1.1. Current Issues

- **Workspace `--recursive` Flag Problems:** Deno's `--recursive` flag has known
  limitations and doesn't work reliably across all scenarios
- **Complex Command Chains:** Current system uses `cd` commands and complex
  chaining (e.g., `cd internal/ai-api && deno task test`)
- **Verbose Commands:** Developer commands are long and hard to remember (e.g.,
  `deno task test:e2e:ai-api`)
- **Maintenance Burden:** Adding new projects requires updating multiple task
  definitions in root `deno.json`

### 1.2. Refactoring Goals

- **Simplify Developer Commands:** Replace verbose `deno task` commands with
  simple `just` recipes
- **Fix Workspace Issues:** Eliminate reliance on problematic `--recursive` flag
- **Improve Maintainability:** Reduce root-level configuration complexity
- **Enhance Developer Experience:** Provide intuitive, short commands for all
  common tasks

## 2. Workspace `--recursive` Flag Issues

### 2.1. Known Problems with Deno Workspace `--recursive`

Based on testing and user reports, the following issues exist with Deno's
workspace `--recursive` flag:

| Issue                        | Description                                                                        | Impact                                   | Workaround                                     |
| :--------------------------- | :--------------------------------------------------------------------------------- | :--------------------------------------- | :--------------------------------------------- |
| **Inconsistent Execution**   | `deno task --recursive test` doesn't reliably execute across all workspace members | High - Tests may not run in all projects | Use explicit `cd` commands                     |
| **Path Resolution Problems** | Relative paths in tasks break when executed from workspace root                    | High - Tasks fail with path errors       | Define tasks relative to project directory     |
| **Error Propagation**        | Failures in one project may not properly stop the entire workflow                  | Medium - Silent failures possible        | Use `&&` chaining with explicit error handling |
| **Limited Task Discovery**   | Not all project tasks are discovered or executed properly                          | Medium - Some tests/tasks skipped        | Explicit task enumeration required             |
| **Performance Issues**       | Slower execution compared to direct task invocation                                | Low - Noticeable but not blocking        | Direct project task execution                  |

### 2.2. Current Workarounds in Use

The current system works around these issues by:

- Using `cd` commands: `cd internal/ai-api && deno task test`
- Explicit task chaining: `deno task test:ai-api && deno task test:ai-chat`
- Project-specific task definitions in root `deno.json`

### 2.3. Target Solution: `just` Task Runner

Replace problematic workspace commands with `just` recipes that provide:

- Reliable cross-project task execution
- Simple, memorable command names
- Proper error handling and dependency management
- No reliance on Deno's workspace `--recursive` functionality

## 3. Required Implementation Work

### 3.1. Target Developer User Stories (To Be Implemented)

| User Story                                                                  | Target Command   | Current Command         | Implementation Required                                      |
| :-------------------------------------------------------------------------- | :--------------- | :---------------------- | :----------------------------------------------------------- |
| **As a developer,** I want to run `just dev-api` to start the AI API server | `just dev-api`   | `deno task dev:api`     | ✅ **REQUIRED** - Create justfile recipe                     |
| **As a developer,** I want to run `just dev-chat` to start the AI Chat app  | `just dev-chat`  | `deno task dev:chat`    | ✅ **REQUIRED** - Create justfile recipe                     |
| **As a developer,** I want to run `just dev-all` for concurrent development | `just dev-all`   | `deno task dev:all`     | ✅ **REQUIRED** - Replace TypeScript script with just recipe |
| **As a developer,** I want to run `just test` to run all tests              | `just test`      | `deno task test`        | ✅ **REQUIRED** - Eliminate `--recursive` dependency         |
| **As a developer,** I want to run `just test-unit` for unit tests only      | `just test-unit` | `deno task test:unit`   | ✅ **REQUIRED** - Fix workspace issues                       |
| **As a developer,** I want to run `just test-e2e` for all E2E tests         | `just test-e2e`  | `deno task test:e2e`    | ✅ **REQUIRED** - Simplify command                           |
| **As a developer,** I want to run `just lint` to lint all projects          | `just lint`      | `deno lint --recursive` | ✅ **REQUIRED** - Replace problematic `--recursive`          |
| **As a developer,** I want to run `just clean` to clean all build artifacts | `just clean`     | ❌ **MISSING**          | ✅ **REQUIRED** - New functionality                          |

### 3.2. Implementation Priority

| Priority          | Task                                          | Effort | Impact                                              |
| :---------------- | :-------------------------------------------- | :----- | :-------------------------------------------------- |
| **P0 - Critical** | Install and configure `just` task runner      | Low    | High - Enables all other improvements               |
| **P0 - Critical** | Create basic `justfile` with core recipes     | Medium | High - Replaces problematic workspace commands      |
| **P1 - High**     | Simplify root `deno.json` configuration       | Low    | Medium - Reduces maintenance burden                 |
| **P1 - High**     | Replace `scripts/dev-all.ts` with just recipe | Low    | Medium - Eliminates custom TypeScript orchestration |
| **P2 - Medium**   | Add missing functionality (clean, format)     | Low    | Low - Nice to have improvements                     |
| **P2 - Medium**   | Update documentation and README               | Low    | Medium - Developer onboarding                       |

## 4. Implementation Plan

### 4.1. Step 1: Install and Configure `just`

**Objective:** Set up `just` task runner as the primary developer interface

**Actions Required:**

1. Install `just` (add to README installation instructions)
2. Create initial `justfile` in repository root
3. Test basic functionality

**Acceptance Criteria:**

- `just --list` shows available recipes
- Basic recipes work (`just dev-api`, `just test`)

### 4.2. Step 2: Create Core `justfile` Recipes

**Objective:** Replace all current `deno task` commands with `just` recipes

**Actions Required:**

1. **Create `justfile` with all required recipes**
2. **Eliminate dependency on workspace `--recursive` flag**
3. **Provide simple, memorable command names**

**Required `justfile` Content:**

```makefile
# ./justfile (TO BE CREATED)

# Set environment variables
set dotenv-load := true

# Default recipe - show available commands
default:
    @just --list

# Development commands
dev-api:
    @echo "🚀 Starting AI API server..."
    @deno task --cwd internal/ai-api dev

dev-chat:
    @echo "🚀 Starting AI Chat app..."
    @deno task --cwd web/ai-chat dev

dev-all:
    @echo "🚀 Starting all services concurrently..."
    @deno run --allow-run --allow-read scripts/dev-all.ts

# Testing commands (avoiding --recursive issues)
test: test-unit test-e2e
    @echo "✅ All tests completed"

test-unit:
    @echo "🔬 Running unit tests..."
    @echo "Testing AI API..."
    @deno task --cwd internal/ai-api test
    @echo "Testing AI Chat..."
    @deno task --cwd web/ai-chat test
    @echo "Testing infrastructure..."
    @deno task --cwd packages/testing-infrastructure test

test-e2e:
    @echo "🌐 Running E2E tests..."
    @deno task --cwd internal/ai-api test:e2e
    @deno task --cwd web/ai-chat test:e2e

test-api:
    @echo "🔧 Testing AI API (unit + E2E)..."
    @deno task --cwd internal/ai-api test
    @deno task --cwd internal/ai-api test:e2e

test-chat:
    @echo "💬 Testing AI Chat (unit + E2E)..."
    @deno task --cwd web/ai-chat test
    @deno task --cwd web/ai-chat test:e2e

# Linting (avoiding --recursive issues)
lint:
    @echo "🔍 Linting all projects..."
    @deno lint internal/ai-api/
    @deno lint web/ai-chat/
    @deno lint packages/testing-infrastructure/

# Formatting
fmt:
    @echo "✨ Formatting all projects..."
    @deno fmt internal/ai-api/
    @deno fmt web/ai-chat/
    @deno fmt packages/testing-infrastructure/

# Cleanup
clean:
    @echo "🧹 Cleaning build artifacts..."
    @rm -rf internal/ai-api/dist/ || true
    @rm -rf web/ai-chat/dist/ || true
    @rm -rf node_modules/.cache/ || true

# Installation
install:
    @echo "📦 Installing dependencies..."
    @deno install --allow-scripts

# Check all (lint + test)
check: lint test
    @echo "✅ All checks passed"
```

**Acceptance Criteria:**

- All current `deno task` commands have `just` equivalents
- No reliance on `--recursive` flag
- Commands work reliably across all projects
- Error handling prevents silent failures

### 4.3. Step 3: Remove Custom TypeScript Orchestration

**Objective:** Replace `scripts/dev-all.ts` with simpler `just` recipe

**Current Implementation Analysis:**

- `scripts/dev-all.ts` is a 127-line TypeScript file for concurrent process
  management
- Provides colored output and process lifecycle management
- Could be replaced with simpler `just` recipe using built-in parallelization

**Actions Required:**

1. Test `just` parallel execution capabilities
2. Create `dev-all` recipe that matches current functionality
3. Remove `scripts/dev-all.ts` file
4. Update root `deno.json` to remove `dev:all` task

**Target Implementation:**

```makefile
# Enhanced dev-all recipe with parallel execution
dev-all:
    @echo "🚀 Starting all services concurrently..."
    @just dev-api & just dev-chat & wait
```

**Alternative with better process management:**

```makefile
dev-all:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "🚀 Starting all services concurrently..."

    # Start services in background
    just dev-api &
    API_PID=$!
    just dev-chat &
    CHAT_PID=$!

    # Wait for interrupt
    trap 'kill $API_PID $CHAT_PID 2>/dev/null || true' EXIT
    wait
```

**Acceptance Criteria:**

- `just dev-all` starts both services concurrently
- Proper signal handling for clean shutdown
- Colored output preserved (if possible)
- `scripts/dev-all.ts` removed

### 4.5. Step 5: Update Documentation

**Objective:** Update all documentation to reflect new `just`-based workflow

**Actions Required:**

1. **Update README.md:**
   - Add `just` installation instructions
   - Replace all `deno task` examples with `just` commands
   - Add quick start section with common commands

2. **Update DEVELOPMENT.md:**
   - Document new development workflow
   - Update command references
   - Add troubleshooting section for `just`

3. **Update TESTING.md:**
   - Replace test command examples
   - Document new testing workflow

**Example README.md Updates:**

````markdown
## Quick Start

### Prerequisites

- [Deno](https://deno.land/) 2.3.6+
- [just](https://github.com/casey/just) task runner

### Installation

```bash
# Install just (choose one method)
cargo install just                    # Via Cargo
brew install just                     # Via Homebrew (macOS)
choco install just                    # Via Chocolatey (Windows)
scoop install just                    # Via Scoop (Windows)

# Install project dependencies
just install
```
````

### Development Commands

```bash
just dev-api          # Start AI API server
just dev-chat         # Start AI Chat app
just dev-all          # Start both services
just test             # Run all tests
just test-unit        # Run unit tests only
just test-e2e         # Run E2E tests only
just lint             # Lint all projects
just fmt              # Format all projects
just clean            # Clean build artifacts
```

**Acceptance Criteria:**

- All documentation updated with `just` commands
- Installation instructions clear and complete
- Examples work as documented
- Old `deno task` references removed

### 4.4. Step 4: Simplify Root `deno.json`

**Objective:** Clean up root configuration by removing orchestration tasks

**Current Root `deno.json` Issues:**

```json
// Current issues in ./deno.json
{
  "tasks": {
    // These orchestration tasks should move to justfile:
    "dev:api": "deno task --cwd internal/ai-api dev",
    "dev:chat": "deno task --cwd web/ai-chat dev",
    "dev:all": "deno run --allow-run --allow-read scripts/dev-all.ts",
    "test": "echo '🧪 Running tests...' && deno task test:all",
    "test:all": "deno task test:ai-api && deno task test:ai-chat && deno task test:testing-infrastructure"
    // ... many more orchestration tasks (22 total)
  }
}
```

**Target Root `deno.json` (Simplified):**

```json
// ./deno.json (TO BE UPDATED)
{
  "workspace": [
    "./internal/ai-api",
    "./web/ai-chat",
    "./packages/testing-infrastructure"
  ],
  "imports": {
    "@std/assert": "jsr:@std/assert@1",
    "@std/testing/bdd": "jsr:@std/testing@1/bdd",
    "ai": "npm:ai@^4.3.16",
    "playwright": "npm:playwright@^1.40.0",
    "@one/testing-infrastructure": "./packages/testing-infrastructure/src/mod.ts"
  },
  "nodeModulesDir": "auto",
  "compilerOptions": {
    "lib": ["deno.ns", "es2022", "dom"]
  }
}
```

**Actions Required:**

1. Remove all 22 orchestration tasks from root `deno.json`
2. Keep only workspace configuration and shared imports
3. Ensure project-level `deno.json` files remain unchanged

**Acceptance Criteria:**

- Root `deno.json` contains no task orchestration
- All functionality moved to `justfile`
- Workspace configuration preserved
- Individual projects unaffected

## 5. Implementation Checklist

### 5.1. Pre-Implementation Checklist

- [ ] **Install `just`** - Ensure `just` is available on development machines
- [ ] **Test `just` functionality** - Verify `just --version` works
- [ ] **Backup current configuration** - Create branch or backup of current
      `deno.json`

### 5.2. Implementation Checklist

#### Phase 1: Basic Setup

- [ ] **Create `justfile`** in repository root
- [ ] **Add basic recipes** (`dev-api`, `dev-chat`, `test-unit`)
- [ ] **Test basic functionality** - Verify recipes work
- [ ] **Add parallel execution** for `dev-all`

#### Phase 2: Complete Migration

- [ ] **Add all remaining recipes** (lint, fmt, clean, etc.)
- [ ] **Test all recipes** - Ensure they work correctly
- [ ] **Remove orchestration tasks** from root `deno.json`
- [ ] **Remove `scripts/dev-all.ts`** file
- [ ] **Test workspace still functions** for imports/dependencies

#### Phase 3: Documentation & Cleanup

- [ ] **Update README.md** with `just` commands
- [ ] **Update DEVELOPMENT.md** documentation
- [ ] **Update TESTING.md** documentation
- [ ] **Test all documented examples**
- [ ] **Remove old command references**

### 5.3. Validation Checklist

#### Functional Testing

- [ ] **`just dev-api`** - Starts AI API server correctly
- [ ] **`just dev-chat`** - Starts AI Chat app correctly
- [ ] **`just dev-all`** - Starts both services concurrently
- [ ] **`just test`** - Runs all tests without `--recursive` issues
- [ ] **`just test-unit`** - Runs unit tests across all projects
- [ ] **`just test-e2e`** - Runs E2E tests correctly
- [ ] **`just lint`** - Lints all projects without errors
- [ ] **`just fmt`** - Formats all projects correctly
- [ ] **`just clean`** - Removes build artifacts

#### Error Handling

- [ ] **Test failure propagation** - Ensure failed tests stop execution
- [ ] **Test signal handling** - Ctrl+C properly stops all processes
- [ ] **Test missing dependencies** - Clear error messages

#### Performance

- [ ] **Compare execution time** - `just` vs current `deno task`
- [ ] **Test concurrent execution** - Verify `dev-all` performance
- [ ] **Memory usage** - Ensure no significant overhead

## 6. Success Criteria

### 6.1. Primary Success Criteria

1. **All workspace `--recursive` dependencies eliminated**
2. **Developer commands simplified** (e.g., `just test` vs `deno task test:all`)
3. **Root `deno.json` simplified** (workspace config only)
4. **No functionality lost** (all current capabilities preserved)
5. **Documentation updated** (clear installation and usage instructions)

### 6.2. Quality Metrics

- **Command execution reliability:** 100% success rate for all `just` recipes
- **Developer onboarding time:** Reduced by eliminating complex command chains
- **Maintenance overhead:** Reduced by centralizing task orchestration in
  `justfile`
- **Error clarity:** Improved error messages and failure handling

### 6.3. Rollback Plan

If implementation fails or causes issues:

1. **Restore root `deno.json`** from backup
2. **Remove `justfile`**
3. **Restore `scripts/dev-all.ts`** if removed
4. **Revert documentation changes**
5. **Continue with current system** until issues resolved

The current system works and should remain functional throughout implementation.

#### Step 2: AI API Service Management

1. **AI API Environment Configuration:**
   - ✅ **IMPLEMENTED:** Comprehensive `.env.example` with all provider
     configurations

   ```bash
   # ./internal/ai-api/.env.example (Current - Working)
   # AI API Service Configuration
   PORT=8000
   HOST=0.0.0.0

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key-here
   # OPENAI_DEFAULT_MODEL=gpt-4o-nano

   # Google Generative AI Configuration
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here
   # GOOGLE_DEFAULT_MODEL=gemini-1.5-flash

   # OpenRouter Configuration (for Anthropic and other models)
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   # OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet

   # Service Configuration
   AI_DEFAULT_MODEL=gpt-4o-nano  # Updated from gpt-4.1-nano
   ```

2. **E2E Test Environment Setup:**

   ```typescript
   // ./packages/testing-infrastructure/src/server-setup.ts (Current - Working)
   // Provides setupServerTestEnvironment, setupUITestEnvironment functions
   // Uses in-process server startup instead of separate processes
   // Includes proper fetch mocking for AI providers
   // Handles server lifecycle automatically in E2E tests

   // Example usage in E2E tests:
   import { setupServerTestEnvironment } from "@one/testing-infrastructure/server-setup";

   const { client, cleanup } = await setupServerTestEnvironment({
     port: 8888,
     providers: ["openai", "google", "openrouter"],
   });

   // Test runs with proper mocking
   // cleanup() called automatically
   ```

#### Step 3: Task Orchestration Analysis

**Current Status:** 🔄 **ALTERNATIVE IMPLEMENTED**

The current system uses `deno task` orchestration which works effectively:

1. **Current Task Orchestration:**
   - ✅ **Working solution:** `deno task dev:all` uses custom TypeScript script
     for concurrent execution
   - ✅ **Comprehensive tasks:** All necessary development and testing tasks are
     available
   - ⚠️ **Workspace limitations:** `--recursive` flag has known issues,
     workaround uses `cd` commands

   ```bash
   # Current working commands (no justfile needed):
   deno task dev:api          # Start AI API server
   deno task dev:chat         # Start AI Chat app
   deno task dev:all          # Start both services concurrently
   deno task test:unit        # Run unit tests
   deno task test:e2e:ai-api  # Run AI API E2E tests
   deno task test:e2e:ai-chat # Run AI Chat E2E tests
   deno task test             # Run all tests
   ```

2. **Optional `justfile` Implementation:**
   - Could provide shorter commands but current system works well
   - Would require additional tooling installation (`just`)
   - Current TypeScript-based orchestration is more maintainable

   ```makefile
   # ./justfile (Optional Enhancement)
   # Shorter commands, but current deno task system works fine

   dev-api:
       @deno task dev:api

   dev-chat:
       @deno task dev:chat

   dev-all:
       @deno task dev:all

   test:
       @deno task test
   ```

### 3.3. Current Directory Structure

**Status:** ✅ **IMPLEMENTED** (with minor variations)

```plaintext
.
├── .gitignore
├── deno.json                  # Root config with workspace orchestration
├── deno.lock                  # Dependency lock file
├── DEVELOPMENT.md             # Development documentation
├── TESTING.md                 # Testing documentation
├── docs/                      # Documentation directory
│   └── development/
├── internal/
│   └── ai-api/
│       ├── deno.json          # ✅ PROJECT-SPECIFIC
│       ├── .env.example       # ✅ Environment template
│       ├── e2e/               # ✅ E2E tests
│       └── ...
├── web/
│   └── ai-chat/
│       ├── deno.json          # ✅ PROJECT-SPECIFIC
│       ├── e2e/               # ✅ E2E tests with UI automation
│       └── ...
├── packages/
│   └── testing-infrastructure/
│       ├── deno.json          # ✅ Shared testing utilities
│       └── src/
├── scripts/
│   └── dev-all.ts             # ✅ Concurrent development orchestration
└── node_modules/              # ✅ Shared dependencies
```

**Key Differences from Original Plan:**

- ❌ No Docker Compose files (not needed for current setup)
- ❌ No `justfile` (current `deno task` system works well)
- ✅ Added `packages/testing-infrastructure` for shared E2E utilities
- ✅ Added comprehensive documentation structure

## 4. Current Status & Recommendations

### 4.1. Implementation Status Summary

| Component                      | Status            | Notes                                              |
| :----------------------------- | :---------------- | :------------------------------------------------- |
| **Workspace Configuration**    | ✅ **COMPLETE**   | Properly configured with all projects              |
| **Project Isolation**          | ✅ **COMPLETE**   | Each project has own `deno.json` with tasks/deps   |
| **AI API Service Management**  | ✅ **COMPLETE**   | Environment config, E2E lifecycle management       |
| **E2E Testing Infrastructure** | ✅ **COMPLETE**   | Advanced testing with fetch mocking, UI automation |
| **Development Orchestration**  | ✅ **COMPLETE**   | TypeScript-based concurrent service startup        |
| **Task Organization**          | 🔄 **FUNCTIONAL** | Works but could be simplified                      |

### 4.2. Identified Issues & Recommendations

1. **Workspace `--recursive` Flag Limitations:**
   - **Issue:** `deno task --recursive` has known issues and doesn't work
     reliably
   - **Current Workaround:** Using `cd` commands in task chains
   - **Recommendation:** Continue with current approach or consider `just` for
     cleaner syntax

2. **Task Command Verbosity:**
   - **Issue:** Commands like `deno task test:e2e:ai-api` are verbose
   - **Current Status:** Functional but could be shorter
   - **Recommendation:** Optional `justfile` implementation for shorter commands

3. **Documentation:**
   - **Status:** Good documentation exists (`DEVELOPMENT.md`, `TESTING.md`)
   - **Recommendation:** Keep documentation updated as system evolves

### 4.3. Optional Improvements (Not Critical)

1. **`justfile` Implementation:** Could provide shorter commands but current
   system works well
2. **CI/CD Integration:** Current task system is CI/CD friendly, no changes
   needed
3. **Developer Onboarding:** Current system is well-documented and functional

## 5. Conclusion

**Overall Assessment:** The monorepo build and task system is **largely
implemented and functional**. The original goals outlined in this specification
have been achieved through the current Deno workspace-based approach.

### 5.1. Key Achievements

- ✅ **Project Isolation:** Each service has its own configuration and
  dependencies
- ✅ **AI API Service Management:** Comprehensive environment configuration and
  E2E test integration
- ✅ **Developer Experience:** Clear commands for all common development tasks
- ✅ **Testing Infrastructure:** Advanced E2E testing with proper service
  lifecycle management
- ✅ **Scalability:** Easy to add new projects to the workspace

### 5.2. Current System Strengths

1. **Deno-Native:** Leverages Deno's built-in workspace functionality
2. **TypeScript Orchestration:** Uses TypeScript for complex orchestration
   (dev-all.ts)
3. **Comprehensive Testing:** Advanced E2E testing infrastructure with fetch
   mocking
4. **Well-Documented:** Clear documentation for developers
5. **No External Dependencies:** Works with built-in Deno tooling

### 5.3. Recommendation

**Continue with the current system.** The original refactoring goals have been
met through a Deno-native approach that is maintainable, scalable, and
developer-friendly. The `justfile` implementation remains optional and could be
added later if shorter commands become a priority.

**Next Steps:** Focus on maintaining the current system and updating
documentation as the monorepo evolves.

# Monorepo Build & Task System: Refactoring Specification

**Document Version:** 1.0
**Date:** June 21, 2025

---

## 1. Introduction & Goals

The current monorepo task system, based on a single, monolithic `deno.jsonc` file, is becoming brittle and difficult to scale. Chained commands with `cd` and complex pathing create a high maintenance burden and a steep learning curve for new developers.

This document specifies a new architecture to address these issues. The primary goals of this refactoring are:

* **Scalability:** Effortlessly add new applications, libraries, or services without significant changes to root-level configurations.
* **Maintainability:** Decentralize project-specific logic so that a project's tasks, dependencies, and infrastructure needs are defined within its own directory.
* **Developer Experience (DX):** Provide a simple, high-level command interface for all common tasks like running, testing, and managing dependencies.
* **CI/CD-Friendliness:** Enable robust and reproducible builds and tests by declaratively managing external services like databases.

## 2. Functional Specification

### 2.1. Key Features

| Feature ID | Description |
| :--- | :--- |
| **F-01: Project Isolation** | Each project (`ai-api`, `ai-chat`, etc.) shall be self-contained. Its build/run tasks and direct dependencies will be defined within its own directory. |
| **F-02: Centralized Orchestration** | A single, simple command-line interface at the root of the monorepo shall be available to orchestrate complex, cross-project workflows. |
| **F-03: Declarative Infrastructure** | The infrastructure required by a project (e.g., a PostgreSQL database) shall be defined as code and managed declaratively. |
| **F-04: Automated E2E Testing Workflow** | Running end-to-end (E2E) tests for a project shall automatically set up the required infrastructure before the tests run and tear it down afterward. |
| **F-05: Global Task Execution** | The system shall support running tasks across all projects simultaneously (e.g., `lint all`, `test all unit`). |

### 2.2. Developer User Stories

* **As a developer,** I want to run `just dev-api` to start the API's development server, without needing to `cd` into its directory.
* **As a developer,** I want to run `just test-unit` to quickly run all unit tests across the entire monorepo.
* **As a developer,** I want to run `just test-e2e-api`, and trust that a clean PostgreSQL instance will be started for my tests and removed when they are complete.
* **As a developer,** when I add a new project `new-app`, I want to add its folder to a single list, create a local `deno.jsonc`, and add new recipes to the `justfile` to integrate it.

## 3. Technical Specification

### 3.1. Core Technologies

1.  **Deno `workspace`:** Deno's native monorepo tooling will be used to resolve local packages and enable per-project task definitions. This is the foundation for `F-01`.
2.  **Docker & Docker Compose:** Docker will containerize external services. Docker Compose will be used to define and run multi-container application environments declaratively, fulfilling `F-03`. We will use multiple, composable files to manage different setups.
3.  **`just` Task Runner:** `just` will be the user-facing orchestration layer (`F-02`). Its recipe-based syntax is ideal for defining dependencies between tasks (e.g., starting a database *before* running tests).

### 3.2. Implementation Steps

#### Step 1: Decentralize Deno Configuration

1.  **Modify Root `deno.jsonc`:**
    * **Action:** Strip all project-specific tasks (e.g., `dev:api`, `test:ai-api`).
    * **Action:** Remove project-specific path-based imports. Only truly global imports (`@std/assert`) or workspace imports (`@one/testing-infrastructure`) should remain.
    * **Action:** Ensure the `workspace` array correctly lists all member projects.
    * **Result:** The root `deno.jsonc` becomes a simple manifest of workspace members and global tasks (`deno test --workspace`).

    ```jsonc
    // ./deno.jsonc (New)
    {
      "workspace": [
        "./internal/ai-api",
        "./web/ai-chat",
        "./packages/testing-infrastructure"
      ],
      "tasks": {
        "test": "deno test --workspace",
        "lint": "deno lint --workspace"
      },
      "imports": {
        "@std/assert": "jsr:@std/assert@1",
        "@one/testing-infrastructure": "./packages/testing-infrastructure/src/mod.ts"
      }
    }
    ```

2.  **Create Project-Level `deno.jsonc` files:**
    * **Action:** In each project directory (e.g., `internal/ai-api/`), create a `deno.jsonc` file.
    * **Action:** Move all tasks and imports specific to that project into this new file. Paths in commands are now relative to the project directory.

    ```jsonc
    // ./internal/ai-api/deno.jsonc (New)
    {
      "imports": {
        "postgres": "npm:postgres@3.4.4"
      },
      "tasks": {
        "dev": "deno run --allow-all --watch main.ts",
        "start": "deno run --allow-all main.ts",
        "test": "deno test --allow-env --allow-net",
        "test:e2e": "deno test --allow-all e2e/"
      }
    }
    ```

#### Step 2: Containerize Infrastructure with Docker Compose

1.  **Create a base `docker-compose.yml`:**
    * **Action:** Define a shared Docker network to allow containers to communicate by name.

    ```yaml
    # ./docker-compose.yml (New)
    version: '3.8'
    networks:
      monorepo-net:
        driver: bridge
    ```

2.  **Create Service-Specific Compose Files:**
    * **Action:** For each project requiring infrastructure, create a corresponding compose file (e.g., `docker-compose.api.yml`).
    * **Action:** Define the services, ports, volumes, and environment variables. Use variable substitution (e.g., `${POSTGRES_USER}`) to pull configuration from a `.env` file.

    ```yaml
    # ./docker-compose.api.yml (New)
    version: '3.8'
    services:
      postgres-api:
        image: postgres:16
        environment:
          POSTGRES_USER: ${POSTGRES_USER}
          POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
          POSTGRES_DB: ${POSTGRES_DB_API}
        ports:
          - "5432:5432"
        volumes:
          - postgres-api-data:/var/lib/postgresql/data
        networks:
          - monorepo-net
    volumes:
      postgres-api-data:
    ```
3.  **Create `.env` file:**
    * **Action:** Create a `.env` file in the root and add it to `.gitignore`.
    * **Action:** Populate it with the secrets needed for Docker Compose.

    ```bash
    # ./.env (New)
    POSTGRES_USER=myuser
    POSTGRES_PASSWORD=mypassword
    POSTGRES_DB_API=api_db
    ```

#### Step 3: Implement the `justfile` Orchestrator

1.  **Create Root `justfile`:**
    * **Action:** Create a file named `justfile` in the monorepo root. This will be the new developer entrypoint.
    * **Action:** Define recipes that abstract away the underlying `deno` and `docker-compose` commands. Use dependencies to chain tasks correctly.

    ```makefile
    # ./justfile (New)

    # Automatically load variables from .env for Docker
    set dotenv-load

    # --- High-Level Aliases ---
    test: test-unit test-e2e   # Run all tests
    dev: dev-api dev-chat      # Run all dev servers

    # --- Unit Testing ---
    test-unit:
        @echo "🔬 Running all unit tests..."
        @deno test --workspace --ignore=e2e/

    # --- E2E Testing (with infrastructure management) ---
    test-e2e: test-e2e-api test-e2e-chat

    test-e2e-api: up-api
        @echo "🌐 Running AI-API E2E tests..."
        @# The || true ensures the 'down' command always runs
        @(deno task --project ai-api test:e2e || true)
        @just down-api

    test-e2e-chat:
        @echo "🌐 Running ai-chat E2E tests..."
        @deno task --project ai-chat test:e2e

    # --- Development Tasks ---
    dev-api:
        @echo "🚀 Starting API server..."
        @deno task --project ai-api dev

    dev-chat:
        @echo "🚀 Starting Chat app..."
        @deno task --project ai-chat dev

    # --- Infrastructure Management Recipes ---
    up-api:
        @echo "🐘 Starting PostgreSQL for API..."
        @docker-compose -f docker-compose.yml -f docker-compose.api.yml up -d

    down-api:
        @echo "🐘 Stopping PostgreSQL for API..."
        @docker-compose -f docker-compose.yml -f docker-compose.api.yml down --volumes -t 1
    ```

### 3.3. Final Directory Structure

```plaintext
.
├── .env
├── .gitignore
├── deno.jsonc                 # Root config (minimal)
├── docker-compose.yml         # Base compose file (network)
├── docker-compose.api.yml     # API-specific services
├── justfile                   # The new command center
├── internal/
│   └── ai-api/
│       ├── deno.jsonc         # <-- PROJECT-SPECIFIC
│       └── ...
└── web/
    └── ai-chat/
        ├── deno.jsonc         # <-- PROJECT-SPECIFIC
        └── ...
```

## 4. Migration & Rollout Plan

1.  **Branch:** All changes will be developed on a dedicated feature branch (e.g., `refactor/build-system`).
2.  **Tooling:** Update `README.md` with instructions for installing `just` and a new list of commands.
3.  **Documentation:** Document the new workflow and the purpose of each new file (`justfile`, `docker-compose.*.yml`).
4.  **CI/CD:** Update CI/CD pipeline configuration files (e.g., `.github/workflows/ci.yml`) to replace old `deno task` commands with the new, simpler `just` recipes (`just test-unit`, `just test-e2e-api`, etc.).
5.  **Team Communication:** Hold a brief meeting to walk the team through the changes, highlighting the improvements to the daily workflow.

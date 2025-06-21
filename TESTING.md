# Testing Guide

This document provides comprehensive information about testing in the One monorepo.

## Quick Start

### Run All Tests
```bash
# Run all tests across all workspace projects
just test

# Run only unit tests
just test-unit

# Run only E2E tests
just test-e2e
```

### Run Tests for Specific Projects
```bash
# AI-API (unit + E2E)
just test-api

# ai-chat (unit + E2E)
just test-chat

# Testing Infrastructure (no tests expected)
# Automatically handled by just test-unit
```

### Run Specific Test Types
```bash
# Unit tests only (all projects)
just test-unit

# E2E tests only (all projects)
just test-e2e

# Individual project tests (using deno task directly)
cd internal/ai-api && deno task test        # AI-API unit tests
cd internal/ai-api && deno task test:e2e    # AI-API E2E tests
cd web/ai-chat && deno task test            # ai-chat unit tests
cd web/ai-chat && deno task test:e2e        # ai-chat E2E tests
```

### Watch Mode
```bash
# Watch unit tests for AI-API
just test-watch-api

# Watch unit tests for ai-chat
just test-watch-chat
```

### Code Quality
```bash
# Run all checks (lint + test)
just check

# Lint all projects
just lint

# Format all projects
just fmt
```

## Workspace Projects

The monorepo contains the following active projects with tests:

### 1. AI-API (`internal/ai-api/`)
- **Unit Tests**: Core service logic, configuration, SDK client
- **E2E Tests**: Complete API flows with external provider mocking
- **Test Commands**:
  - `deno task test` - Unit tests
  - `deno task test:e2e` - E2E tests

### 2. ai-chat (`web/ai-chat/`)
- **Unit Tests**: React components, hooks, services
- **Integration Tests**: Service integration testing
- **E2E Tests**: UI automation with browser testing
- **Test Commands**:
  - `deno task test` - Unit tests
  - `deno task test:unit` - Unit tests only
  - `deno task test:integration` - Integration tests
  - `deno task test:e2e` - E2E tests
  - `deno task test:e2e-ui` - UI E2E tests only
  - `deno task test:all` - All tests
  - `deno task test:watch` - Watch mode

### 3. Testing Infrastructure (`packages/testing-infrastructure/`)
- **Purpose**: Shared testing utilities and infrastructure
- **No Tests**: This package provides testing tools for other projects
- **Features**: Fetch mocking, server setup, UI automation, scenarios

## Testing Architecture

### Shared Testing Infrastructure

All projects use the shared testing infrastructure from `@one/testing-infrastructure`:

```typescript
import { 
  FetchMockManager, 
  createSuccessScenario,
  createUITestEnvironment 
} from "@one/testing-infrastructure";
```

**Benefits**:
- ✅ No code duplication between projects
- ✅ Consistent testing patterns
- ✅ Centralized maintenance
- ✅ Comprehensive mocking capabilities

### Test Types

1. **Unit Tests**: Test individual components/functions in isolation
2. **Integration Tests**: Test service interactions and data flow
3. **E2E Tests**: Test complete user workflows end-to-end
4. **UI E2E Tests**: Browser automation testing actual user interactions

### Mocking Strategy

- **External APIs**: Mocked using shared fetch mocking system
- **AI Providers**: OpenAI, Google, OpenRouter, Anthropic all supported
- **Network Conditions**: Delays, errors, rate limits can be simulated
- **UI Testing**: Real browser automation with mocked backend APIs

## Test Execution Flow

When you run `just test`, the following happens:

1. **AI-API Tests**:
   - Unit tests for core logic (33 tests)
   - E2E tests for API endpoints with mocked providers (6 test suites)

2. **ai-chat Tests**:
   - Unit tests for React components and services (126 test steps)
   - E2E tests for UI workflows with browser automation

3. **Testing Infrastructure**:
   - Checks for any tests (none expected, provides utilities only)

## Continuous Integration

The workspace is configured to ensure:

- ✅ All tests must pass before merging
- ✅ Both unit and E2E tests are executed
- ✅ Cross-project dependencies are validated
- ✅ Shared infrastructure changes are tested across all consumers

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Tests use random ports to avoid conflicts
2. **Browser Issues**: E2E tests may fail if browser resources are locked
3. **Timing Issues**: Network delays and async operations are properly handled
4. **Mock Issues**: Fetch mocking logs all intercepted requests for debugging

### Debugging Tests

```bash
# Run with verbose output
just test-api

# Check specific test file
cd internal/ai-api && deno test e2e/basic_providers.e2e.ts

# Run UI tests with visible browser (set headless: false in test config)
cd web/ai-chat && deno task test:e2e
```

### Getting Help

1. Check test logs for specific error messages
2. Review the testing infrastructure documentation in `packages/testing-infrastructure/README.md`
3. Look at example tests in `packages/testing-infrastructure/examples/`
4. Use the migration guide in `packages/testing-infrastructure/MIGRATION.md`

## Best Practices

1. **Always run all tests** before committing changes
2. **Use shared infrastructure** instead of creating custom test utilities
3. **Write both unit and E2E tests** for new features
4. **Mock external dependencies** to ensure test reliability
5. **Use descriptive test names** that explain what is being tested
6. **Keep tests isolated** - each test should be independent
7. **Clean up resources** properly in test teardown

## Adding New Tests

### For New Features
1. Add unit tests for core logic
2. Add integration tests for service interactions
3. Add E2E tests for user workflows
4. Use shared testing infrastructure utilities

### For New Projects
1. Add project to workspace in root `deno.json`
2. Add test tasks following the established patterns
3. Update this documentation
4. Use `@one/testing-infrastructure` for consistency

## Performance

- **Unit Tests**: Fast execution (< 5 seconds)
- **E2E Tests**: Slower due to server startup and browser automation (30-60 seconds)
- **Total Test Suite**: Typically completes in under 2 minutes
- **Parallel Execution**: Projects are tested sequentially to avoid resource conflicts

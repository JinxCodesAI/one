# Testing Guide for AI Chat v2

This document describes the comprehensive testing strategy for the AI Chat v2
application, including unit tests, integration tests, and end-to-end tests.

## Test Architecture

The testing strategy follows a multi-layered approach:

1. **Unit Tests** - Test individual components and functions in isolation
2. **Integration Tests** - Test interactions between components and services
3. **End-to-End Tests** - Test complete user flows from frontend to backend

## Test Structure

```
web/ai-chat/
├── src/
│   ├── components/
│   │   └── __tests__/           # Component unit tests
│   ├── hooks/
│   │   └── __tests__/           # Hook integration tests
│   ├── services/
│   │   └── __tests__/           # Service unit tests
│   └── test-utils/
│       └── setup.ts             # Test utilities and setup
├── e2e/
│   ├── utils/                   # E2E test utilities
│   │   ├── external-mock.ts     # Mock manager for external APIs
│   │   └── test-setup.ts        # E2E test setup utilities
│   ├── chat-flow.e2e.ts         # Core chat functionality E2E tests
│   └── frontend-integration.e2e.ts # Frontend integration E2E tests
└── TESTING.md                   # This file
```

## Running Tests

### All Tests

```bash
# Run all tests (unit + integration + E2E)
deno task test:all
```

### Unit Tests Only

```bash
# Run unit tests only (excludes E2E and integration tests)
deno task test:unit
```

### Integration Tests

```bash
# Run integration tests
deno task test:integration
```

### End-to-End Tests

```bash
# Run E2E tests
deno task test:e2e
```

### Development Testing

```bash
# Run tests in watch mode (excludes E2E)
deno task test:watch

# Run specific test file
deno test --allow-net --allow-env src/components/__tests__/MessageList.test.tsx
```

## Test Categories

### 1. Component Unit Tests

Located in `src/components/__tests__/`

Tests individual React components in isolation:

- **MessageList.test.tsx** - Message display and formatting
- **MessageInput.test.tsx** - Message input and form handling
- **ModelSelector.test.tsx** - Model selection functionality
- **ErrorMessage.test.tsx** - Error display and retry functionality
- **ChatContainer.test.tsx** - Chat container layout and state management

**Key Features:**

- Uses React Testing Library for component testing
- JSDOM environment for DOM simulation
- Mock user interactions with userEvent
- Tests component props, state, and event handling

### 2. Integration Tests

Located in `src/hooks/__tests__/`

Tests integration between hooks and services:

- **useChat.integration.ts** - Tests useChat hook with real AI client service

**Key Features:**

- Tests complete data flow from hook to service
- Mocked external API responses
- State management validation
- Error handling scenarios

### 3. Service Unit Tests

Located in `src/services/__tests__/`

Tests service layer methods in isolation:

- **aiClient.test.ts** - Tests ChatAIClient service methods

**Key Features:**

- Mocked fetch responses
- Error scenario testing
- API contract validation
- Network error handling

### 4. End-to-End Tests

Located in `e2e/`

Tests complete user flows from frontend through backend to external services:

- **chat-flow.e2e.ts** - Core chat functionality flows
- **frontend-integration.e2e.ts** - Frontend integration with real backend

**Key Features:**

- Real AI API server integration
- External API mocking using FetchMockManager
- Complete request flow validation
- Error handling and retry scenarios

## E2E Testing Architecture

The E2E tests follow the architecture described in the E2E Testing Guide:

### FetchMockManager

Intercepts external API calls while allowing internal service communication:

```typescript
const mockManager = new FetchMockManager(scenario);
mockManager.start();
// Tests run with mocked external APIs
mockManager.stop();
```

### Mock Scenarios

Define how external requests should be handled:

```typescript
const scenario = {
  name: "Successful AI response",
  isRequestExpected: (context, metadata) => {
    return metadata.isExternalApi && metadata.service === "openai";
  },
  generateResponse: (context, metadata) => {
    return RequestAnalyzer.generateSuccessResponse(context, metadata);
  },
};
```

### Request Classification

Automatically classifies requests as internal vs external:

- **Internal**: localhost, .local, .internal domains
- **External**: api.openai.com, generativelanguage.googleapis.com, openrouter.ai

## Test Utilities

### React Testing Setup

`src/test-utils/setup.ts` provides:

- JSDOM environment configuration
- Mock utilities for fetch, console, etc.
- Helper functions for creating test data
- React Testing Library setup

### E2E Test Utilities

`e2e/utils/` provides:

- **external-mock.ts**: FetchMockManager and RequestAnalyzer
- **test-setup.ts**: Server setup, test configuration, scenario helpers

## Writing Tests

### Component Tests

```typescript
import { beforeEach, describe, it } from "@std/testing/bdd";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "../MyComponent.tsx";

describe("MyComponent", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should render correctly", () => {
    render(<MyComponent prop="value" />);
    assertExists(screen.getByText("Expected text"));
  });
});
```

### Service Tests

```typescript
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { mockFetch } from "../../test-utils/setup.ts";
import { MyService } from "../MyService.ts";

describe("MyService", () => {
  let restoreFetch: () => void;

  beforeEach(() => {
    restoreFetch = mockFetch({
      "/api/endpoint": { success: true, data: "response" },
    });
  });

  afterEach(() => {
    restoreFetch();
  });

  it("should call API correctly", async () => {
    const service = new MyService();
    const result = await service.method();
    assertEquals(result, "response");
  });
});
```

### E2E Tests

```typescript
import { after, before, describe, it } from "@std/testing/bdd";
import { FetchMockManager } from "./utils/external-mock.ts";
import { createSuccessfulAIScenario } from "./utils/test-setup.ts";

describe("E2E: Feature Flow", () => {
  let mockManager: FetchMockManager;

  before(async () => {
    const scenario = createSuccessfulAIScenario("AI response");
    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  after(async () => {
    mockManager.stop();
  });

  it("should complete flow end-to-end", async () => {
    // Test implementation
  });
});
```

## Test Data

### Mock Messages

```typescript
const messages = [
  {
    role: "user" as const,
    content: "Hello, how are you?",
    timestamp: new Date("2025-01-01T10:00:00Z"),
  },
  {
    role: "assistant" as const,
    content: "Hello! I'm doing well, thank you.",
    timestamp: new Date("2025-01-01T10:00:01Z"),
  },
];
```

### Mock AI Client

```typescript
const mockClient = createMockAIClient({
  generateText: async () => ({
    content: "Test response",
    model: "gpt-4.1-nano",
    usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 },
  }),
});
```

## Best Practices

### 1. Test Isolation

- Clean up DOM between tests
- Reset mocks and state
- Use fresh instances for each test

### 2. Descriptive Test Names

- Use "should" statements
- Describe the expected behavior
- Include context when relevant

### 3. Arrange-Act-Assert Pattern

- **Arrange**: Set up test data and mocks
- **Act**: Execute the code under test
- **Assert**: Verify the expected outcome

### 4. Error Testing

- Test both success and failure scenarios
- Verify error messages and handling
- Test edge cases and boundary conditions

### 5. Async Testing

- Use proper async/await patterns
- Wait for state changes with waitFor
- Handle promise rejections appropriately

## Continuous Integration

Tests are designed to run in CI environments:

- No external dependencies (APIs are mocked)
- Deterministic results
- Fast execution
- Clear failure reporting

## Debugging Tests

### Common Issues

1. **JSDOM Environment**: Ensure DOM setup is correct
2. **Async Operations**: Use waitFor for state changes
3. **Mock Cleanup**: Restore mocks after each test
4. **Test Isolation**: Clean up between tests

### Debug Tools

```typescript
// Log request history in E2E tests
const requestLog = mockManager.getRequestLog();
console.log("Requests:", requestLog);

// Debug component state
screen.debug(); // Prints current DOM

// Check mock calls
const consoleMock = mockConsole();
console.log("Console logs:", consoleMock.logs);
```

## Coverage

The test suite aims for comprehensive coverage:

- **Components**: All user interactions and edge cases
- **Services**: All methods and error scenarios
- **Hooks**: State management and side effects
- **E2E**: Critical user journeys and error flows

Run tests with coverage reporting:

```bash
deno test --coverage=coverage/ src/
deno coverage coverage/
```

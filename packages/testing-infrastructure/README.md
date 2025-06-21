# Testing Infrastructure

Shared testing utilities for the One monorepo, providing standardized E2E testing infrastructure with fetch mocking, server setup, and UI automation.

## Features

- **Unified Fetch Mocking**: Comprehensive system for mocking external API calls
- **Server Test Setup**: Utilities for starting servers and creating clients
- **UI Test Setup**: Browser automation and UI testing helpers
- **Pre-built Scenarios**: Common mock scenarios for AI providers
- **Test Helpers**: Utility functions for common testing patterns

## Usage

### Basic Server E2E Testing

```typescript
import { describe, it, before } from "@std/testing/bdd";
import { 
  FetchMockManager, 
  createServerTestEnvironment,
  createSuccessScenario 
} from "@one/testing-infrastructure/server-setup";

describe("My API Tests", () => {
  let mockManager: FetchMockManager;
  let testEnv: ServerTestEnvironment;

  before(async () => {
    const scenario = createSuccessScenario("openai", "Hello from OpenAI!");
    mockManager = new FetchMockManager(scenario);
    mockManager.start();
    
    testEnv = await createServerTestEnvironment();
  });

  it("should work", async () => {
    const response = await testEnv.client.generateText({
      messages: [{ role: "user", content: "Hello" }],
      model: "gpt-4.1-nano"
    });
    
    assertEquals(response.content, "Hello from OpenAI!");
  });
});
```

### UI E2E Testing

```typescript
import { describe, it, before } from "@std/testing/bdd";
import { 
  createUITestEnvironment,
  createUISuccessScenario,
  UITestHelpers 
} from "@one/testing-infrastructure/ui-setup";

describe("UI Tests", () => {
  let testEnv: UITestEnvironment;

  before(async () => {
    const scenario = createUISuccessScenario();
    testEnv = await createUITestEnvironment(scenario);
  });

  it("should send message", async () => {
    await UITestHelpers.typeText(testEnv.page, '[data-testid="message-input"]', 'Hello');
    await UITestHelpers.clickElement(testEnv.page, '[data-testid="send-button"]');
    await UITestHelpers.waitForMessage(testEnv.page, 'assistant');
  });
});
```

## Architecture

The testing infrastructure is designed with modularity and reusability in mind:

- **fetch-mock.ts**: Core fetch mocking system with two-phase request handling
- **server-setup.ts**: Server startup and client creation utilities
- **ui-setup.ts**: Browser automation and UI test environment setup
- **scenarios.ts**: Pre-built mock scenarios for common testing patterns
- **helpers.ts**: Utility functions and test helpers

## Advanced Usage Examples

### Custom Mock Scenarios

```typescript
import {
  FetchMockManager,
  RequestAnalyzer,
  type MockScenario
} from "@one/testing-infrastructure/fetch-mock";

// Create a custom scenario with specific behavior
const customScenario: MockScenario = {
  name: "Custom API behavior",
  isRequestExpected: (context, metadata) => {
    return metadata.isExternalApi && metadata.provider === 'openai';
  },
  generateResponse: (context, metadata) => {
    const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
    const body = response.body as any;

    // Customize based on request content
    const requestBody = context.body as any;
    if (requestBody?.messages?.[0]?.content?.includes('urgent')) {
      body.choices[0].message.content = "This is an urgent response!";
      response.delay = 100; // Faster response for urgent requests
    }

    return response;
  }
};
```

### Error Testing

```typescript
import { createErrorScenario, createMixedScenario } from "@one/testing-infrastructure/scenarios";

// Test rate limiting
const rateLimitScenario = createErrorScenario('rate_limit', ['openai']);

// Test mixed provider behavior
const mixedScenario = createMixedScenario({
  openai: 'success',
  google: 'error',
  openrouter: 'slow'
});
```

### Server Test Manager for Multiple Tests

```typescript
import { ServerTestManager } from "@one/testing-infrastructure/server-setup";

describe("My API Tests", () => {
  const testManager = new ServerTestManager(
    startServer,
    createSimpleClient,
    createServerTestConfig()
  );

  before(async () => {
    await testManager.setup();
  });

  after(async () => {
    await testManager.cleanup();
  });

  it("should work", async () => {
    const env = testManager.getEnvironment();
    const client = env.client as ReturnType<typeof createSimpleClient>;
    // ... test logic
  });
});
```

### UI Testing with Custom Setup

```typescript
import {
  createUITestEnvironment,
  UITestHelpers,
  createUITestConfig
} from "@one/testing-infrastructure/ui-setup";

describe("Custom UI Tests", () => {
  let testEnv: UITestEnvironment;

  before(async () => {
    const config = createUITestConfig({
      headless: false, // Show browser during development
      timeout: 60000,  // Longer timeout for complex interactions
      customEnvVars: {
        'CUSTOM_FEATURE_FLAG': 'enabled'
      }
    });

    testEnv = await createUITestEnvironment(
      startServer,
      createUISuccessScenario(),
      config
    );
  });

  it("should handle complex interactions", async () => {
    const { page } = testEnv;

    // Use helper functions for common patterns
    await UITestHelpers.typeText(page, '[data-testid="input"]', 'Hello');
    await UITestHelpers.clickElement(page, '[data-testid="submit"]');
    await UITestHelpers.waitForMessage(page, 'assistant');

    // Take screenshot for debugging
    await UITestHelpers.takeScreenshot(page, 'after-interaction');
  });
});
```

## Testing Utilities

### Test Data Generation

```typescript
import { TestDataGenerator } from "@one/testing-infrastructure/helpers";

const randomMessages = TestDataGenerator.randomChatMessages(5);
const testEmail = TestDataGenerator.randomEmail();
const testModels = TestDataGenerator.getTestModels();
```

### Environment Management

```typescript
import { TestEnvironment } from "@one/testing-infrastructure/helpers";

// Set test environment variables
TestEnvironment.setEnvVars({
  'CUSTOM_API_KEY': 'test-key',
  'DEBUG_MODE': 'true'
});

// Restore original values after tests
TestEnvironment.restoreEnvVars();
```

### Retry Logic for Flaky Tests

```typescript
import { TestRetry } from "@one/testing-infrastructure/helpers";

it("should handle flaky operations", async () => {
  const result = await TestRetry.withRetry(async () => {
    // Some potentially flaky operation
    return await client.generateText(messages, model);
  }, 3, 1000); // 3 attempts, 1 second base delay

  assertEquals(result.content, expectedContent);
});
```

## Migration Guide

### From Old Test Structure

**Before:**
```typescript
import { FetchMockManager } from "./utils/fetch-mock.ts";
import { setupTestEnvironment } from "./utils/test-setup.ts";

// Custom scenario setup
const scenario = { /* complex setup */ };
const mockManager = new FetchMockManager(scenario);
```

**After:**
```typescript
import {
  FetchMockManager,
  createSuccessScenario
} from "@one/testing-infrastructure";

// Simple scenario creation
const scenario = createSuccessScenario(['openai'], { openai: 'Custom response' });
const mockManager = new FetchMockManager(scenario);
```

## Best Practices

1. **Use Pre-built Scenarios**: Start with `createSuccessScenario`, `createErrorScenario`, etc.
2. **Batch Test Updates**: Use `ServerTestManager` for multiple related tests
3. **Environment Isolation**: Each test should use unique ports and clean environments
4. **Proper Cleanup**: Always call cleanup functions in `after` hooks
5. **Meaningful Test Data**: Use `TestDataGenerator` for consistent test data
6. **Error Handling**: Test both success and failure scenarios
7. **Performance Testing**: Use `createSlowResponseScenario` to test timeout handling

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Use `generateTestPort()` for unique ports
2. **Timing Issues**: Use `TestTiming.waitFor()` for async conditions
3. **Mock Not Working**: Check `isRequestExpected` logic in scenarios
4. **UI Tests Failing**: Increase timeouts and use `UITestHelpers.takeScreenshot()`

### Debugging

```typescript
// Enable request logging
const mockManager = new FetchMockManager(scenario);
mockManager.start();

// After tests, check what was intercepted
const requestLog = mockManager.getRequestLog();
console.log('Intercepted requests:', requestLog);
```

## Avoiding Circular Dependencies

This package is designed to be dependency-free from internal services. It provides generic utilities that can be used by any service in the monorepo without creating circular dependencies.

### Architecture Principles

1. **Generic Interfaces**: Uses generic types for servers and clients
2. **Dependency Injection**: Accepts server startup and client factory functions
3. **No Internal Imports**: Does not import from internal services
4. **Configurable**: All behavior is configurable through parameters

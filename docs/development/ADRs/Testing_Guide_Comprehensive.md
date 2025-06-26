# Comprehensive Testing Guide for One Monorepo

**Status**: Active
**Date**: 2025-06-21

## Overview

This guide provides detailed instructions for creating and running tests in the
One monorepo, leveraging our shared testing infrastructure and established
patterns.

## Quick Reference

### Running Tests

```bash
# Run all tests across all projects
deno task test

# Run specific test types
deno task test:unit          # All unit tests
deno task test:e2e           # All E2E tests

# Run tests for specific projects
deno task test:ai-api        # AI-API (unit + E2E)
deno task test:ai-chat    # ai-chat (unit + E2E)

# Run specific test categories
deno task test:unit:ai-api   # AI-API unit tests only
deno task test:e2e:ai-api    # AI-API E2E tests only

# Watch mode for development
deno task test:watch:ai-api
deno task test:watch:ai-chat
```

### Test File Naming Conventions

```
Unit Tests:        *.test.ts
Integration Tests: *.integration.ts
E2E Tests:         *.e2e.ts
UI E2E Tests:      *.ui.e2e.ts
```

## Testing Architecture

### 1. Shared Testing Infrastructure

All tests use `@one/testing-infrastructure` for consistency:

```typescript
import {
  createSuccessScenario,
  createUITestEnvironment,
  FetchMockManager,
  UITestHelpers,
} from "@one/testing-infrastructure";
```

### 2. globalThis.fetch Override Strategy

Our E2E testing uses a sophisticated fetch override mechanism that:

- **Intercepts ALL HTTP requests** via `globalThis.fetch` override
- **Passes through internal requests** (localhost, .local, .internal domains)
- **Mocks external API calls** (OpenAI, Google, OpenRouter, etc.)
- **Logs all requests** for debugging and verification

```typescript
// The FetchMockManager automatically:
// 1. Analyzes each request to determine if it's internal or external
// 2. Passes internal requests to real services
// 3. Mocks external requests based on scenarios
// 4. Logs everything for debugging

const mockManager = new FetchMockManager(scenario);
mockManager.start(); // Overrides globalThis.fetch
// ... run tests ...
mockManager.stop(); // Restores original fetch
```

### 3. Two-Phase Request Handling

Each mock scenario defines:

1. **Request Validation** (`isRequestExpected`): Determines if request should be
   mocked
2. **Response Generation** (`generateResponse`): Creates appropriate mock
   response

```typescript
const scenario: MockScenario = {
  name: "OpenAI Success",
  isRequestExpected: (_context, metadata) => {
    return metadata.isExternalApi && metadata.provider === "openai";
  },
  generateResponse: (context, metadata) => {
    const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
    response.body.choices[0].message.content = "Custom response";
    return response;
  },
};
```

## Creating New Tests

### 1. Unit Tests

**Location**: `src/**/__tests__/*.test.ts`

**Example**: Component logic testing

```typescript
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";

describe("MessageInput Component Logic", () => {
  it("should handle message validation", () => {
    const validMessage = "Hello, world!";
    const emptyMessage = "";

    assertEquals(validMessage.trim().length > 0, true);
    assertEquals(emptyMessage.trim().length === 0, true);
  });

  it("should handle special characters in messages", () => {
    const messageWithEmoji = "Hello 👋 World!";
    const messageWithCode = "Run `deno test` command";

    assertEquals(messageWithEmoji.length > 0, true);
    assertEquals(messageWithCode.includes("`"), true);
  });
});
```

### 2. Integration Tests

**Location**: `src/**/__tests__/*.integration.ts`

**Example**: Service integration testing

```typescript
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { createMockAIClient, mockFetch } from "../../test-utils/setup.ts";

describe("Chat Integration Logic", () => {
  let restoreFetch: () => void;

  beforeEach(() => {
    restoreFetch = mockFetch({
      "/models": {
        success: true,
        data: { models: ["gpt-4.1-nano", "gemini-2.5-flash"] },
      },
    });
  });

  afterEach(() => {
    restoreFetch();
  });

  it("should handle model loading logic", async () => {
    const mockClient = createMockAIClient();
    const availableModels = await mockClient.getModels();

    assertEquals(availableModels.length, 2);
    assertEquals(availableModels.includes("gpt-4.1-nano"), true);
  });
});
```

### 3. E2E API Tests

**Location**: `e2e/*.e2e.ts`

**Example**: Complete API flow testing

```typescript
import { before, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
  createServerTestEnvironment,
  createSingleProviderSuccessScenario,
  FetchMockManager,
} from "@one/testing-infrastructure";

describe("E2E: OpenAI Provider", () => {
  const EXPECTED_RESPONSE = "Hello! This is GPT-4.1-nano responding.";
  let mockManager: FetchMockManager;
  let testEnv: ServerTestEnvironment;

  before(async () => {
    // Create scenario with specific response
    const scenario = createSingleProviderSuccessScenario(
      "openai",
      EXPECTED_RESPONSE,
    );
    mockManager = new FetchMockManager(scenario);
    mockManager.start();

    // Setup test environment
    testEnv = await createServerTestEnvironment(
      startServer,
      createSimpleClient,
    );
  });

  it("should generate text with OpenAI model", async () => {
    const response = await testEnv.client.generateText({
      messages: [{ role: "user", content: "Hello" }],
      model: "gpt-4.1-nano",
    });

    assertEquals(response.content, EXPECTED_RESPONSE);
    assertEquals(response.model, "gpt-4.1-nano");
  });
});
```

### 4. UI E2E Tests

**Location**: `e2e/*.ui.e2e.ts`

**Example**: Browser automation testing

```typescript
import { after, before, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
  createUISuccessScenario,
  createUITestConfig,
  createUITestEnvironment,
  UITestHelpers,
} from "@one/testing-infrastructure";

describe("UI E2E: Chat Application Flow", () => {
  const OPENAI_RESPONSE =
    "Hello! This is GPT-4.1-nano responding through the UI.";
  let testEnvironment: UITestEnvironment;

  before(async () => {
    const config = createUITestConfig();
    const scenario = createUISuccessScenario(OPENAI_RESPONSE);
    testEnvironment = await createUITestEnvironment(
      startServer,
      scenario,
      config,
    );
  });

  after(async () => {
    await testEnvironment.cleanup();
  });

  beforeEach(async () => {
    await UITestHelpers.clearConversation(testEnvironment.page);
  });

  it("should complete full chat flow", async () => {
    const { page } = testEnvironment;

    // Select model
    await UITestHelpers.selectOption(
      page,
      '[data-testid="model-selector"]',
      "gpt-4.1-nano",
    );

    // Type and send message
    await UITestHelpers.typeText(
      page,
      '[data-testid="message-input"]',
      "Hello!",
    );
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');

    // Wait for response
    await UITestHelpers.waitForMessage(page, "assistant", 15000);

    // Verify conversation
    const messages = await UITestHelpers.getAllMessages(page);
    assertEquals(messages.length, 2);
    assertEquals(messages[1].content?.includes(OPENAI_RESPONSE), true);
  });
});
```

## Advanced Testing Patterns

### 1. Custom Mock Scenarios

```typescript
import { MockScenario, RequestAnalyzer } from "@one/testing-infrastructure";

const customScenario: MockScenario = {
  name: "Custom behavior based on request content",
  isRequestExpected: (_context, metadata) => {
    return metadata.isExternalApi && metadata.provider === "openai";
  },
  generateResponse: (context, metadata) => {
    const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
    const body = response.body as any;

    // Customize based on request content
    const requestBody = context.body as any;
    if (requestBody?.messages?.[0]?.content?.includes("urgent")) {
      body.choices[0].message.content = "This is an urgent response!";
      response.delay = 100; // Faster response
    } else {
      body.choices[0].message.content = "This is a normal response.";
      response.delay = 1000; // Normal response time
    }

    return response;
  },
};
```

### 2. Error Testing

```typescript
import { createErrorScenario } from "@one/testing-infrastructure";

describe("E2E: Error Handling", () => {
  let mockManager: FetchMockManager;

  before(() => {
    // Test rate limiting
    const scenario = createErrorScenario("rate_limit", ["openai"]);
    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should handle OpenAI rate limits", async () => {
    const testEnv = await createServerTestEnvironment();

    await assertRejects(
      async () => {
        await testEnv.client.generateText({
          messages: [{ role: "user", content: "This should fail" }],
          model: "gpt-4.1-nano",
        });
      },
      Error,
      "Rate limit exceeded",
    );
  });
});
```

### 3. Dynamic Scenario Switching

```typescript
describe("E2E: Dynamic Scenarios", () => {
  let mockManager: FetchMockManager;

  before(() => {
    const successScenario = createSuccessScenario(["openai"]);
    mockManager = new FetchMockManager(successScenario);
    mockManager.start();
  });

  it("should handle scenario switching", async () => {
    const testEnv = await createServerTestEnvironment();

    // First request succeeds
    const response1 = await testEnv.client.generateText({
      messages: [{ role: "user", content: "Hello" }],
      model: "gpt-4.1-nano",
    });
    assertExists(response1.content);

    // Switch to error scenario
    const errorScenario = createErrorScenario("rate_limit", ["openai"]);
    mockManager.setScenario(errorScenario);

    // Second request fails
    await assertRejects(
      async () => {
        await testEnv.client.generateText({
          messages: [{ role: "user", content: "This should fail" }],
          model: "gpt-4.1-nano",
        });
      },
      Error,
    );
  });
});
```

## Test Data and Utilities

### 1. Test Data Generation

```typescript
import { TestDataGenerator } from "@one/testing-infrastructure/helpers";

// Generate realistic test data
const randomMessages = TestDataGenerator.randomChatMessages(5);
const testEmail = TestDataGenerator.randomEmail();
const testModels = TestDataGenerator.getTestModels();

// Use in tests
it("should handle multiple messages", () => {
  const messages = TestDataGenerator.randomChatMessages(3);
  assertEquals(messages.length, 3);
  assertEquals(messages[0].role, "user");
});
```

### 2. Environment Management

```typescript
import { TestEnvironment } from "@one/testing-infrastructure/helpers";

describe("Environment-dependent tests", () => {
  beforeEach(() => {
    TestEnvironment.setEnvVars({
      "AI_API_URL": "http://localhost:8000",
      "DEBUG_MODE": "true",
    });
  });

  afterEach(() => {
    TestEnvironment.restoreEnvVars();
  });
});
```

### 3. Retry Logic for Flaky Tests

```typescript
import { TestRetry } from "@one/testing-infrastructure/helpers";

it("should handle flaky operations", async () => {
  const result = await TestRetry.withRetry(
    async () => {
      // Some potentially flaky operation
      return await client.generateText(messages, model);
    },
    3,
    1000,
  ); // 3 attempts, 1 second base delay

  assertEquals(result.content, expectedContent);
});
```

## Debugging Tests

### 1. Request Logging

```typescript
describe("Debug test", () => {
  let mockManager: FetchMockManager;

  before(() => {
    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should log all requests", async () => {
    // Run test...

    // Check what was intercepted
    const requestLog = mockManager.getRequestLog();
    console.log("All requests:", requestLog);

    const externalRequests = requestLog.filter((req) =>
      req.metadata.isExternalApi
    );
    console.log("External API calls:", externalRequests);
  });
});
```

### 2. UI Test Screenshots

```typescript
it("should take screenshots for debugging", async () => {
  const { page } = testEnvironment;

  // Take screenshot before interaction
  await UITestHelpers.takeScreenshot(page, "before-interaction");

  // Perform interaction
  await UITestHelpers.clickElement(page, '[data-testid="send-button"]');

  // Take screenshot after interaction
  await UITestHelpers.takeScreenshot(page, "after-interaction");
});
```

### 3. Verbose Test Output

```bash
# Run with detailed output
deno task test:e2e:ai-api --verbose

# Run specific test file
cd internal/ai-api && deno test e2e/basic_providers.e2e.ts --verbose

# Run with console output
deno test --allow-all --no-check e2e/custom_models.e2e.ts
```

## Best Practices

### 1. Test Organization

- **One concept per test**: Each test should verify one specific behavior
- **Descriptive names**: Use clear, descriptive test and scenario names
- **Constants at top**: Define expected responses and test data as constants
- **Proper cleanup**: Always clean up resources in `after` hooks

### 2. Mock Design

- **Minimal overrides**: Only customize what you actually assert
- **Realistic responses**: Use helper utilities for realistic response
  structures
- **Service-specific**: Respect each external service's response format
- **Provider validation**: Be specific about which providers to accept

### 3. Error Testing

- **Specific errors**: Test specific error conditions (rate limits, invalid
  requests)
- **Retry behavior**: Verify retry logic with multiple error responses
- **Error propagation**: Ensure errors propagate correctly through the stack
- **Timeout handling**: Test timeout scenarios with delayed responses

### 4. UI Testing

- **Data attributes**: Use `data-testid` attributes for reliable element
  selection
- **Wait strategies**: Use appropriate wait strategies for dynamic content
- **State isolation**: Clear state between tests to avoid interference
- **Realistic interactions**: Test actual user interactions, not just API calls

## Common Patterns

### 1. BDD Test Structure

```typescript
import { after, before, beforeEach, describe, it } from "@std/testing/bdd";

describe("Feature: User Authentication", () => {
  // Test constants
  const VALID_USER = { email: "test@example.com", password: "password123" };
  const INVALID_USER = { email: "invalid@example.com", password: "wrong" };

  // Setup
  before(async () => {
    // One-time setup
  });

  beforeEach(() => {
    // Per-test setup
  });

  after(async () => {
    // Cleanup
  });

  describe("Scenario: Valid credentials", () => {
    it("should authenticate successfully", async () => {
      // Test implementation
    });
  });

  describe("Scenario: Invalid credentials", () => {
    it("should reject authentication", async () => {
      // Test implementation
    });
  });
});
```

### 2. Provider-Specific Testing

```typescript
// Test each AI provider separately
describe("E2E: OpenAI Provider", () => {
  const scenario = createSingleProviderSuccessScenario(
    "openai",
    OPENAI_RESPONSE,
  );
  // ... test implementation
});

describe("E2E: Google Provider", () => {
  const scenario = createSingleProviderSuccessScenario(
    "google",
    GOOGLE_RESPONSE,
  );
  // ... test implementation
});

describe("E2E: OpenRouter Provider", () => {
  const scenario = createSingleProviderSuccessScenario(
    "openrouter",
    ANTHROPIC_RESPONSE,
  );
  // ... test implementation
});
```

### 3. Multi-Provider Testing

```typescript
describe("E2E: Multiple Providers", () => {
  const scenario = createSuccessScenario(["openai", "google", "openrouter"], {
    openai: OPENAI_RESPONSE,
    google: GOOGLE_RESPONSE,
    openrouter: ANTHROPIC_RESPONSE,
  });

  it("should test all providers in sequence", async () => {
    // Test OpenAI
    const response1 = await client.generateText({
      messages: [{ role: "user", content: "Hello OpenAI" }],
      model: "gpt-4.1-nano",
    });
    assertEquals(response1.content, OPENAI_RESPONSE);

    // Test Google
    const response2 = await client.generateText({
      messages: [{ role: "user", content: "Hello Google" }],
      model: "gemini-2.5-flash",
    });
    assertEquals(response2.content, GOOGLE_RESPONSE);

    // Test OpenRouter
    const response3 = await client.generateText({
      messages: [{ role: "user", content: "Hello Claude" }],
      model: "anthropic/claude-3.5-sonnet",
    });
    assertEquals(response3.content, ANTHROPIC_RESPONSE);
  });
});
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Tests use random ports to avoid conflicts
2. **Timing Issues**: Use appropriate timeouts and wait strategies
3. **Mock Not Working**: Check `isRequestExpected` logic in scenarios
4. **UI Tests Failing**: Increase timeouts and use screenshots for debugging
5. **Fetch Override Issues**: Ensure proper cleanup of mock managers

### Getting Help

1. Check test logs for specific error messages
2. Review the testing infrastructure documentation in
   `packages/testing-infrastructure/README.md`
3. Look at example tests in `packages/testing-infrastructure/examples/`
4. Enable request logging to see what's being intercepted

## Conclusion

This testing infrastructure provides a comprehensive, maintainable, and scalable
approach to testing in the One monorepo. By following these patterns and using
the shared infrastructure, you can create reliable tests that provide true
end-to-end coverage while remaining fast and maintainable.

For more detailed examples, see:

- `packages/testing-infrastructure/examples/`
- `internal/ai-api/e2e/`
- `web/ai-chat/e2e/`
- `web/ai-chat/src/**/__tests__/`

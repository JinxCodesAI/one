/**
 * Advanced E2E tests for complex scenarios
 *
 * Tests advanced functionality including:
 * - Error handling scenarios
 * - Network delay simulation
 * - Dynamic scenario switching
 * - Request logging and debugging
 *
 * Migrated to use shared testing infrastructure from @one/testing-infrastructure
 */

import { before, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists, assertRejects } from "@std/assert";
import {
  createErrorScenario,
  createSlowResponseScenario,
  createSuccessScenario,
  FetchMockManager,
  type MockScenario,
  RequestAnalyzer,
} from "@one/testing-infrastructure";
import {
  createTestConfig,
  setupServerAndClient,
  setupTestEnvironment,
} from "./utils/test-setup.ts";

// Test constants
const OPENAI_RESPONSE_CONTENT = "Hello! This is a mocked OpenAI response.";
const GOOGLE_RESPONSE_CONTENT =
  "Hello! This is a mocked Google Gemini response.";
const OPENROUTER_RESPONSE_CONTENT =
  "Hello! This is a mocked OpenRouter/Anthropic response.";
const NETWORK_DELAY_MS = 2000;

describe("E2E Advanced: Multiple Providers", () => {
  let mockManager: FetchMockManager;

  before(() => {
    // Use the shared success scenario for multiple providers
    const scenario = createSuccessScenario(
      ["openai", "google", "openrouter"],
      {
        openai: OPENAI_RESPONSE_CONTENT,
        google: GOOGLE_RESPONSE_CONTENT,
        openrouter: OPENROUTER_RESPONSE_CONTENT,
      },
    );

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should test all providers in sequence", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      // Test OpenAI
      const openaiResponse = await client.generateText({
        messages: [{ role: "user", content: "Hello OpenAI" }],
        model: "gpt-4.1-nano",
      });
      assertEquals(openaiResponse.content, OPENAI_RESPONSE_CONTENT);

      // Test Google
      const googleResponse = await client.generateText({
        messages: [{ role: "user", content: "Hello Google" }],
        model: "gemini-2.5-flash",
      });
      assertEquals(googleResponse.content, GOOGLE_RESPONSE_CONTENT);

      // Test OpenRouter/Anthropic
      const anthropicResponse = await client.generateText({
        messages: [{ role: "user", content: "Hello Anthropic" }],
        model: "anthropic/claude-3.5-sonnet",
      });
      assertEquals(anthropicResponse.content, OPENROUTER_RESPONSE_CONTENT);

      // Verify request log
      const requestLog = mockManager.getRequestLog();
      assertEquals(requestLog.length >= 6, true); // 3 local + 3 external requests
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Advanced: OpenAI Error Handling", () => {
  let mockManager: FetchMockManager;

  before(() => {
    // Use the shared error scenario for OpenAI
    const scenario = createErrorScenario("rate_limit", ["openai"]);

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should handle OpenAI API errors", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      // Test that OpenAI error is properly handled
      await assertRejects(
        async () => {
          await client.generateText({
            messages: [{ role: "user", content: "This should fail" }],
            model: "gpt-4.1-nano",
          });
        },
        Error,
        // Note: Error message can vary (rate limit, timeout, etc.) - just verify error is thrown
      );
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Advanced: Google Error Handling", () => {
  let mockManager: FetchMockManager;

  before(() => {
    // Use the shared error scenario for Google
    const scenario = createErrorScenario("invalid_request", ["google"]);

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should handle Google API errors", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      // Test that Google error is properly handled
      await assertRejects(
        async () => {
          await client.generateText({
            messages: [{ role: "user", content: "This should fail" }],
            model: "gemini-2.5-flash",
          });
        },
        Error,
      );
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Advanced: Network Delay Simulation", () => {
  let mockManager: FetchMockManager;

  before(() => {
    // Use the shared slow response scenario
    const scenario = createSlowResponseScenario(NETWORK_DELAY_MS, ["openai"]);

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should simulate network delays", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      // Measure response time
      const startTime = Date.now();

      const response = await client.generateText({
        messages: [{ role: "user", content: "This should be slow" }],
        model: "gpt-4.1-nano",
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should take at least 2 seconds due to mock delay
      assertEquals(responseTime >= NETWORK_DELAY_MS, true);
      assertExists(response.content);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Advanced: Dynamic Scenario Switching", () => {
  let mockManager: FetchMockManager;

  before(() => {
    const successScenario: MockScenario = {
      name: "All providers successful",
      isRequestExpected: (_context, metadata) => {
        return metadata.isApiCall && metadata.provider === "openai";
      },
      generateResponse: (context, metadata) => {
        return RequestAnalyzer.generateSuccessResponse(context, metadata);
      },
    };

    mockManager = new FetchMockManager(successScenario);
    mockManager.start();
  });

  it("should handle dynamic scenario switching", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      // First request should succeed
      const successResponse = await client.generateText({
        messages: [{ role: "user", content: "First request" }],
        model: "gpt-4.1-nano",
      });
      assertExists(successResponse.content);

      // Switch to error scenario
      const errorScenario: MockScenario = {
        name: "OpenAI API error",
        isRequestExpected: (_context, metadata) => {
          return metadata.isApiCall && metadata.provider === "openai";
        },
        generateResponse: (context, metadata) => {
          return RequestAnalyzer.generateErrorResponse(
            context,
            metadata,
            "rate_limit",
          );
        },
      };
      mockManager.setScenario(errorScenario);

      // Second request should fail
      await assertRejects(
        async () => {
          await client.generateText({
            messages: [{ role: "user", content: "Second request" }],
            model: "gpt-4.1-nano",
          });
        },
        Error,
      );

      // Switch back to success
      const successScenario: MockScenario = {
        name: "All providers successful",
        isRequestExpected: (_context, metadata) => {
          return metadata.isApiCall && metadata.provider === "openai";
        },
        generateResponse: (context, metadata) => {
          return RequestAnalyzer.generateSuccessResponse(context, metadata);
        },
      };
      mockManager.setScenario(successScenario);

      // Third request should succeed again
      const finalResponse = await client.generateText({
        messages: [{ role: "user", content: "Third request" }],
        model: "gpt-4.1-nano",
      });
      assertExists(finalResponse.content);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Advanced: Request Logging", () => {
  let mockManager: FetchMockManager;

  before(() => {
    const scenario: MockScenario = {
      name: "All providers successful",
      isRequestExpected: (_context, metadata) => {
        return metadata.isApiCall &&
          ["openai", "google"].includes(metadata.provider);
      },
      generateResponse: (context, metadata) => {
        const response = RequestAnalyzer.generateSuccessResponse(
          context,
          metadata,
        );
        // deno-lint-ignore no-explicit-any
        const body = response.body as any;

        if (metadata.provider === "openai") {
          body.choices[0].message.content = OPENAI_RESPONSE_CONTENT;
        } else if (metadata.provider === "google") {
          body.candidates[0].content.parts[0].text = GOOGLE_RESPONSE_CONTENT;
        }

        return response;
      },
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should verify request logging", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      // Clear any existing logs
      mockManager.clearRequestLog();

      // Make several requests
      await client.generateText({
        messages: [{ role: "user", content: "Request 1" }],
        model: "gpt-4.1-nano",
      });

      await client.generateText({
        messages: [{ role: "user", content: "Request 2" }],
        model: "gemini-2.5-flash",
      });

      await client.getHealth();

      // Verify request log
      const requestLog = mockManager.getRequestLog();

      // Should have local requests to our server + external API calls
      assertEquals(requestLog.length >= 3, true);

      // Check that we have both local and external requests
      const localRequests = requestLog.filter((req) =>
        req.context.url.includes("localhost")
      );
      const externalRequests = requestLog.filter((req) =>
        !req.context.url.includes("localhost")
      );

      assertEquals(localRequests.length >= 3, true); // generate, generate, health
      assertEquals(externalRequests.length >= 2, true); // openai, google
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

/**
 * Advanced Testing Scenarios Examples
 *
 * This file demonstrates advanced testing patterns and scenarios using the
 * shared testing infrastructure:
 * - Custom mock scenarios
 * - Error handling tests
 * - Network delay simulation
 * - Mixed provider behaviors
 * - Request logging and debugging
 */

import { after, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists, assertRejects } from "@std/assert";
import {
  createErrorScenario,
  createMixedScenario,
  createServerTestConfig,
  createServerTestEnvironment,
  createSlowResponseScenario,
  FetchMockManager,
  type MockScenario,
  RequestAnalyzer,
  type ServerTestEnvironment,
  TestRetry,
} from "@one/testing-infrastructure";

// Mock implementations for this example
const startServer = () =>
  Promise.resolve({
    stop: () => Promise.resolve(console.log("Server stopped")),
  });

const createClient = (baseUrl: string) => ({
  generateText: async (
    messages: Array<{ role: string; content: string }>,
    model: string,
  ) => {
    // This would make actual HTTP requests that get intercepted by mocks
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },
});

describe("Advanced Testing Scenarios", () => {
  let testEnv: ServerTestEnvironment;

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  describe("Error Handling Scenarios", () => {
    it("should handle rate limit errors", async () => {
      // Create rate limit error scenario
      const scenario = createErrorScenario("rate_limit", ["openai"]);
      const mockManager = new FetchMockManager(scenario);
      mockManager.start();

      try {
        testEnv = await createServerTestEnvironment(
          startServer,
          createClient,
          createServerTestConfig(),
        );

        const client = testEnv.client as ReturnType<typeof createClient>;

        // This should throw an error due to rate limiting
        await assertRejects(
          async () => {
            await client.generateText(
              [{ role: "user", content: "Hello" }],
              "gpt-4.1-nano",
            );
          },
          Error,
          "rate limit",
        );

        console.log("✅ Rate limit error handling verified!");
      } finally {
        mockManager.stop();
      }
    });

    it("should handle invalid request errors", async () => {
      const scenario = createErrorScenario("invalid_request", ["google"]);
      const mockManager = new FetchMockManager(scenario);
      mockManager.start();

      try {
        testEnv = await createServerTestEnvironment(
          startServer,
          createClient,
          createServerTestConfig(),
        );

        const client = testEnv.client as ReturnType<typeof createClient>;

        await assertRejects(
          async () => {
            await client.generateText(
              [{ role: "user", content: "Hello" }],
              "gemini-2.5-flash",
            );
          },
          Error,
        );

        console.log("✅ Invalid request error handling verified!");
      } finally {
        mockManager.stop();
      }
    });
  });

  describe("Network Delay Simulation", () => {
    it("should handle slow responses", async () => {
      const DELAY_MS = 2000;
      const scenario = createSlowResponseScenario(DELAY_MS, ["openai"]);
      const mockManager = new FetchMockManager(scenario);
      mockManager.start();

      try {
        testEnv = await createServerTestEnvironment(
          startServer,
          createClient,
          createServerTestConfig(),
        );

        const client = testEnv.client as ReturnType<typeof createClient>;

        // Measure response time
        const startTime = Date.now();
        const response = await client.generateText(
          [{ role: "user", content: "Hello" }],
          "gpt-4.1-nano",
        );
        const duration = Date.now() - startTime;

        assertExists(response);
        assertEquals(duration >= DELAY_MS, true);

        console.log(
          `✅ Slow response simulation verified! Duration: ${duration}ms`,
        );
      } finally {
        mockManager.stop();
      }
    });
  });

  describe("Mixed Provider Behaviors", () => {
    it("should handle different provider behaviors", async () => {
      const scenario = createMixedScenario({
        openai: "success",
        google: "error",
        openrouter: "slow",
      });
      const mockManager = new FetchMockManager(scenario);
      mockManager.start();

      try {
        testEnv = await createServerTestEnvironment(
          startServer,
          createClient,
          createServerTestConfig(),
        );

        const client = testEnv.client as ReturnType<typeof createClient>;

        // OpenAI should succeed
        const openaiResponse = await client.generateText(
          [{ role: "user", content: "Hello" }],
          "gpt-4.1-nano",
        );
        assertExists(openaiResponse);

        // Google should fail
        await assertRejects(
          async () => {
            await client.generateText(
              [{ role: "user", content: "Hello" }],
              "gemini-2.5-flash",
            );
          },
        );

        // OpenRouter should be slow but succeed
        const startTime = Date.now();
        const openrouterResponse = await client.generateText(
          [{ role: "user", content: "Hello" }],
          "anthropic/claude-3.5-sonnet",
        );
        const duration = Date.now() - startTime;

        assertExists(openrouterResponse);
        assertEquals(duration >= 1000, true); // Should have some delay

        console.log("✅ Mixed provider behaviors verified!");
      } finally {
        mockManager.stop();
      }
    });
  });

  describe("Custom Scenarios", () => {
    it("should support custom request validation", async () => {
      const scenario: MockScenario = {
        name: "Custom validation scenario",
        isRequestExpected: (context, metadata) => {
          // Only allow requests with specific content
          const body = context.body as Record<string, unknown>;
          return metadata.isExternalApi &&
            body?.messages?.[0]?.content?.includes("allowed");
        },
        generateResponse: (context, metadata) => {
          return RequestAnalyzer.generateSuccessResponse(context, metadata);
        },
      };

      const mockManager = new FetchMockManager(scenario);
      mockManager.start();

      try {
        testEnv = await createServerTestEnvironment(
          startServer,
          createClient,
          createServerTestConfig(),
        );

        const client = testEnv.client as ReturnType<typeof createClient>;

        // This should succeed (contains 'allowed')
        const response = await client.generateText(
          [{ role: "user", content: "This is allowed content" }],
          "gpt-4.1-nano",
        );
        assertExists(response);

        // This should fail (doesn't contain 'allowed')
        await assertRejects(
          async () => {
            await client.generateText(
              [{ role: "user", content: "This is forbidden content" }],
              "gpt-4.1-nano",
            );
          },
          Error,
          "Unexpected external request",
        );

        console.log("✅ Custom validation scenario verified!");
      } finally {
        mockManager.stop();
      }
    });
  });

  describe("Request Logging and Debugging", () => {
    it("should log and analyze requests", async () => {
      const scenario = createMixedScenario({
        openai: "success",
        google: "success",
      });
      const mockManager = new FetchMockManager(scenario);
      mockManager.start();

      try {
        testEnv = await createServerTestEnvironment(
          startServer,
          createClient,
          createServerTestConfig(),
        );

        const client = testEnv.client as ReturnType<typeof createClient>;

        // Make multiple requests
        await client.generateText(
          [{ role: "user", content: "Test 1" }],
          "gpt-4.1-nano",
        );
        await client.generateText(
          [{ role: "user", content: "Test 2" }],
          "gemini-2.5-flash",
        );

        // Analyze request log
        const requestLog = mockManager.getRequestLog();
        const externalRequests = requestLog.filter((req) =>
          req.metadata.isExternalApi
        );

        assertEquals(externalRequests.length >= 2, true);

        // Check provider distribution
        const openaiRequests = externalRequests.filter((req) =>
          req.metadata.provider === "openai"
        );
        const googleRequests = externalRequests.filter((req) =>
          req.metadata.provider === "google"
        );

        assertEquals(openaiRequests.length >= 1, true);
        assertEquals(googleRequests.length >= 1, true);

        console.log(
          `✅ Request logging verified! Total: ${requestLog.length}, External: ${externalRequests.length}`,
        );
      } finally {
        mockManager.stop();
      }
    });
  });

  describe("Retry Logic Testing", () => {
    it("should handle flaky operations with retry", async () => {
      let attemptCount = 0;
      const scenario: MockScenario = {
        name: "Flaky scenario",
        isRequestExpected: (_context, metadata) => metadata.isExternalApi,
        generateResponse: (context, metadata) => {
          attemptCount++;
          if (attemptCount < 3) {
            // Fail first 2 attempts
            return RequestAnalyzer.generateErrorResponse(
              context,
              metadata,
              "server_error",
            );
          }
          // Succeed on 3rd attempt
          return RequestAnalyzer.generateSuccessResponse(context, metadata);
        },
      };

      const mockManager = new FetchMockManager(scenario);
      mockManager.start();

      try {
        testEnv = await createServerTestEnvironment(
          startServer,
          createClient,
          createServerTestConfig(),
        );

        const client = testEnv.client as ReturnType<typeof createClient>;

        // Use retry logic to handle flaky operation
        const result = await TestRetry.withRetry(
          async () => {
            return await client.generateText(
              [{ role: "user", content: "Flaky test" }],
              "gpt-4.1-nano",
            );
          },
          3,
          500,
        );

        assertExists(result);
        assertEquals(attemptCount, 3); // Should have taken 3 attempts

        console.log("✅ Retry logic verified!");
      } finally {
        mockManager.stop();
      }
    });
  });
});

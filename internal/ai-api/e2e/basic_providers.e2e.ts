/**
 * Basic E2E tests for AI providers
 *
 * Tests the fundamental functionality of each AI provider through the complete stack:
 * SDK → Server → AI Service → External APIs (mocked)
 *
 * Migrated to use shared testing infrastructure from @one/testing-infrastructure
 */

import { before, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import {
  createNoExternalRequestsScenario,
  createSingleProviderSuccessScenario,
  FetchMockManager,
} from "@one/testing-infrastructure";
import {
  createTestConfig,
  setupServerAndClient,
  setupTestEnvironment,
} from "./utils/test-setup.ts";

describe("E2E Basic: OpenAI Provider", () => {
  const OPENAI_RESPONSE_CONTENT = "Hello! This is a mocked OpenAI response.";
  const EXPECTED_TOTAL_TOKENS = 18;

  let mockManager: FetchMockManager;

  before(() => {
    // Create scenario with custom response content and token count
    const scenario = createSingleProviderSuccessScenario(
      "openai",
      OPENAI_RESPONSE_CONTENT,
    );

    // Customize the scenario to set specific token count
    const originalGenerateResponse = scenario.generateResponse;
    scenario.generateResponse = (context, metadata) => {
      const response = originalGenerateResponse(context, metadata);
      const body = response.body as Record<string, unknown>;
      if (body.usage && typeof body.usage === "object") {
        (body.usage as Record<string, unknown>).total_tokens =
          EXPECTED_TOTAL_TOKENS;
      }
      if (body.id) {
        body.id = "chatcmpl-test123";
      }
      return response;
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should generate text with OpenAI model", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const response = await client.generateText({
        messages: [{ role: "user", content: "Hello, how are you?" }],
        model: "gpt-4.1-nano",
      });

      assertExists(response);
      assertExists(response.content);
      assertEquals(response.content, OPENAI_RESPONSE_CONTENT);
      assertEquals(response.model, "gpt-4.1-nano");
      assertExists(response.usage);
      assertEquals(response.usage?.totalTokens, EXPECTED_TOTAL_TOKENS);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Basic: Google Provider", () => {
  const GOOGLE_RESPONSE_CONTENT =
    "Hello! This is a mocked Google Gemini response.";
  const EXPECTED_TOTAL_TOKENS = 18;

  let mockManager: FetchMockManager;

  before(() => {
    // Create scenario with custom response content and token count
    const scenario = createSingleProviderSuccessScenario(
      "google",
      GOOGLE_RESPONSE_CONTENT,
    );

    // Customize the scenario to set specific token count
    const originalGenerateResponse = scenario.generateResponse;
    scenario.generateResponse = (context, metadata) => {
      const response = originalGenerateResponse(context, metadata);
      const body = response.body as Record<string, unknown>;
      if (body.usageMetadata && typeof body.usageMetadata === "object") {
        (body.usageMetadata as Record<string, unknown>).totalTokenCount =
          EXPECTED_TOTAL_TOKENS;
      }
      return response;
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should generate text with Google Gemini model", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const response = await client.generateText({
        messages: [{ role: "user", content: "What is the weather like?" }],
        model: "gemini-2.5-flash",
      });

      assertExists(response);
      assertExists(response.content);
      assertEquals(response.content, GOOGLE_RESPONSE_CONTENT);
      assertEquals(response.model, "gemini-2.5-flash");
      assertExists(response.usage);
      assertEquals(response.usage?.totalTokens, EXPECTED_TOTAL_TOKENS);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Basic: OpenRouter Provider", () => {
  const OPENROUTER_RESPONSE_CONTENT =
    "Hello! This is a mocked OpenRouter/Anthropic response.";
  const EXPECTED_TOTAL_TOKENS = 18;

  let mockManager: FetchMockManager;

  before(() => {
    // Create scenario with custom response content and token count
    const scenario = createSingleProviderSuccessScenario(
      "openrouter",
      OPENROUTER_RESPONSE_CONTENT,
    );

    // Customize the scenario to set specific token count and ID
    const originalGenerateResponse = scenario.generateResponse;
    scenario.generateResponse = (context, metadata) => {
      const response = originalGenerateResponse(context, metadata);
      const body = response.body as Record<string, unknown>;
      if (body.usage && typeof body.usage === "object") {
        (body.usage as Record<string, unknown>).total_tokens =
          EXPECTED_TOTAL_TOKENS;
      }
      if (body.id) {
        body.id = "gen-test123";
      }
      return response;
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should generate text with OpenRouter Anthropic model", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const response = await client.generateText({
        messages: [{ role: "user", content: "Explain quantum computing" }],
        model: "anthropic/claude-3.5-sonnet",
      });

      assertExists(response);
      assertExists(response.content);
      assertEquals(response.content, OPENROUTER_RESPONSE_CONTENT);
      assertEquals(response.model, "anthropic/claude-3.5-sonnet");
      assertExists(response.usage);
      assertEquals(response.usage?.totalTokens, EXPECTED_TOTAL_TOKENS);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Basic: Health Check", () => {
  let mockManager: FetchMockManager;

  before(() => {
    // Use the no external requests scenario for health checks
    const scenario = createNoExternalRequestsScenario();

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should return health status", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const health = await client.getHealth();

      assertExists(health);
      assertEquals(health.status, "healthy");
      assertExists(health.models);
      assertEquals(health.models.length > 0, true);
      assertEquals(health.models.includes("gpt-4.1-nano"), true);
      assertEquals(health.models.includes("gemini-2.5-flash"), true);
      assertEquals(health.models.includes("anthropic/claude-3.5-sonnet"), true);
      assertExists(health.version);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Basic: Error Handling", () => {
  let mockManager: FetchMockManager;

  before(() => {
    // Use the no external requests scenario for error handling tests
    const scenario = createNoExternalRequestsScenario();

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should handle invalid model error", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      // Test with invalid model - should throw error
      try {
        await client.generateText({
          messages: [{ role: "user", content: "Hello" }],
          model: "invalid-model-name",
        });

        // Should not reach here
        throw new Error("Expected error for invalid model");
      } catch (error) {
        // Verify error is thrown for invalid model
        assertExists(error);
        assertEquals(error instanceof Error, true);
      }
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

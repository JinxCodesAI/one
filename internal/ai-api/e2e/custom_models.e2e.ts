/**
 * E2E tests for custom model configurations
 *
 * Example of how to create new E2E tests following the naming convention:
 * >>>>something<<<<<_test.e2e.ts
 *
 * This file demonstrates testing custom model configurations and edge cases.
 */

import { before, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import {
  FetchMockManager,
  type MockScenario,
  RequestAnalyzer,
} from "./utils/fetch-mock.ts";
import {
  createTestConfig,
  setupServerAndClient,
  setupTestEnvironment,
} from "./utils/test-setup.ts";

// Test constants
const GPT_MINI_RESPONSE_CONTENT =
  "This is a custom response for GPT-4.1-mini model.";
const GEMINI_RESPONSE_CONTENT =
  "This is a custom response for Gemini 2.5 Flash model.";
const EXPECTED_TOTAL_TOKENS = 18; // AI service calculates actual token usage

describe("E2E Custom Models: GPT-4.1-mini", () => {
  let mockManager: FetchMockManager;

  before(() => {
    const scenario: MockScenario = {
      name: "Custom GPT-4.1-mini response",
      isRequestExpected: (_context, metadata) => {
        return metadata.isApiCall && metadata.provider === "openai";
      },
      generateResponse: (context, metadata) => {
        const response = RequestAnalyzer.generateSuccessResponse(
          context,
          metadata,
        );
        // deno-lint-ignore no-explicit-any
        const body = response.body as any;
        body.choices[0].message.content = GPT_MINI_RESPONSE_CONTENT;
        body.id = "chatcmpl-custom123";
        return response;
      },
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should generate custom response for GPT-4.1-mini", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const response = await client.generateText({
        messages: [{ role: "user", content: "Tell me about AI" }],
        model: "gpt-4.1-mini",
      });

      assertExists(response);
      assertExists(response.content);
      assertEquals(response.content, GPT_MINI_RESPONSE_CONTENT);
      assertEquals(response.model, "gpt-4.1-mini");
      assertExists(response.usage);
      assertEquals(response.usage?.totalTokens, EXPECTED_TOTAL_TOKENS);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Custom Models: Gemini 2.5 Flash", () => {
  let mockManager: FetchMockManager;

  before(() => {
    const scenario: MockScenario = {
      name: "Custom Gemini 2.5 Flash response",
      isRequestExpected: (_context, metadata) => {
        return metadata.isApiCall && metadata.provider === "google";
      },
      generateResponse: (context, metadata) => {
        const response = RequestAnalyzer.generateSuccessResponse(
          context,
          metadata,
        );
        // deno-lint-ignore no-explicit-any
        const body = response.body as any;
        body.candidates[0].content.parts[0].text = GEMINI_RESPONSE_CONTENT;
        return response;
      },
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should generate custom response for Gemini 2.5 Flash", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const response = await client.generateText({
        messages: [{ role: "user", content: "Explain machine learning" }],
        model: "gemini-2.5-flash",
      });

      assertExists(response);
      assertExists(response.content);
      assertEquals(response.content, GEMINI_RESPONSE_CONTENT);
      assertEquals(response.model, "gemini-2.5-flash");
      assertExists(response.usage);
      assertEquals(response.usage?.totalTokens, EXPECTED_TOTAL_TOKENS);
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Custom Models: Parameter Validation", () => {
  let mockManager: FetchMockManager;

  before(() => {
    const scenario: MockScenario = {
      name: "Parameter validation",
      isRequestExpected: (_context, metadata) => {
        return metadata.isApiCall && metadata.provider === "openai";
      },
      generateResponse: (context, metadata) => {
        return RequestAnalyzer.generateSuccessResponse(context, metadata);
      },
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should handle custom parameters", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const response = await client.generateText({
        messages: [{
          role: "user",
          content: "Generate text with custom parameters",
        }],
        model: "gpt-4.1-nano",
        maxTokens: 100,
        temperature: 0.7,
      });

      assertExists(response);
      assertExists(response.content);
      assertEquals(response.model, "gpt-4.1-nano");
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

describe("E2E Custom Models: Multi-turn Conversation", () => {
  let mockManager: FetchMockManager;

  before(() => {
    const scenario: MockScenario = {
      name: "Multi-turn conversation",
      isRequestExpected: (_context, metadata) => {
        return metadata.isApiCall && metadata.provider === "openai";
      },
      generateResponse: (context, metadata) => {
        return RequestAnalyzer.generateSuccessResponse(context, metadata);
      },
    };

    mockManager = new FetchMockManager(scenario);
    mockManager.start();
  });

  it("should handle conversation history", async () => {
    const config = createTestConfig();
    setupTestEnvironment(config);
    const { client, cleanup } = await setupServerAndClient(config);

    try {
      const response = await client.generateText({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello!" },
          { role: "assistant", content: "Hi there! How can I help you?" },
          { role: "user", content: "What's the weather like?" },
        ],
        model: "gpt-4.1-nano",
      });

      assertExists(response);
      assertExists(response.content);
      assertEquals(response.model, "gpt-4.1-nano");
    } finally {
      await cleanup();
      mockManager.stop();
    }
  });
});

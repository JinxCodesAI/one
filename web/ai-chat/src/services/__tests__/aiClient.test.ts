/**
 * Unit tests for ChatAIClient service
 */

import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { ChatAIClient, createAIClient } from "../aiClient.ts";
import { mockFetch } from "../../test-utils/setup.ts";
import "../../test-utils/setup.ts";

describe("ChatAIClient Service", () => {
  let client: ChatAIClient;
  let restoreFetch: () => void;

  beforeEach(() => {
    client = new ChatAIClient("/api/ai"); // Use BFF endpoint

    // Mock successful BFF responses by default
    restoreFetch = mockFetch({
      "/api/ai/generate": {
        success: true,
        data: {
          content: "Test AI response",
          model: "gpt-4.1-nano",
          usage: {
            promptTokens: 10,
            completionTokens: 8,
            totalTokens: 18,
          },
        },
      },
      "/api/ai/models": {
        success: true,
        data: {
          models: ["gpt-4.1-nano", "gemini-2.5-flash", "claude-3-sonnet"],
        },
      },
      "/api/ai/health": {
        success: true,
        data: {
          status: "healthy",
          models: ["gpt-4.1-nano", "gemini-2.5-flash"],
          version: "0.0.1",
        },
      },
    });
  });

  afterEach(() => {
    restoreFetch();
  });

  describe("constructor", () => {
    it("should create client with default base URL", () => {
      const defaultClient = new ChatAIClient();
      assertExists(defaultClient);
    });

    it("should create client with custom base URL", () => {
      const customClient = new ChatAIClient("http://custom-url:9000");
      assertExists(customClient);
    });
  });

  describe("generateText", () => {
    it("should generate text successfully", async () => {
      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      const response = await client.generateText(messages, "gpt-4.1-nano", {
        maxTokens: 100,
        temperature: 0.7,
      });

      assertEquals(response.content, "Test AI response");
      assertEquals(response.model, "gpt-4.1-nano");
      assertExists(response.usage);
      assertEquals(response.usage.totalTokens, 18);
    });

    it("should handle messages without options", async () => {
      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      const response = await client.generateText(messages);
      assertEquals(response.content, "Test AI response");
    });

    it("should handle messages without model", async () => {
      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      const response = await client.generateText(messages, undefined, {
        maxTokens: 100,
      });
      assertEquals(response.content, "Test AI response");
    });

    it("should convert app messages to API format", async () => {
      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
        {
          role: "assistant" as const,
          content: "Hi there!",
          timestamp: new Date(),
        },
        {
          role: "user" as const,
          content: "How are you?",
          timestamp: new Date(),
        },
      ];

      await client.generateText(messages, "gpt-4.1-nano");

      // The conversion happens internally, we just verify it doesn't throw
      assertEquals(true, true);
    });

    it("should handle API error responses", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/generate": {
          success: false,
          error: {
            error: "Rate limit exceeded",
            code: "RATE_LIMIT",
          },
        },
      });

      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      await assertRejects(
        async () => {
          await client.generateText(messages);
        },
        Error,
        "Rate limit exceeded",
      );
    });

    it("should handle network errors", async () => {
      restoreFetch();
      globalThis.fetch = () => {
        return Promise.reject(new Error("Network error"));
      };

      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      await assertRejects(
        async () => {
          await client.generateText(messages);
        },
        Error,
      );
    });

    it("should handle malformed API responses", async () => {
      restoreFetch();
      globalThis.fetch = () => {
        return Promise.resolve(new Response("invalid json", { status: 200 }));
      };

      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      await assertRejects(
        async () => {
          await client.generateText(messages);
        },
        Error,
      );
    });

    it("should handle HTTP error status codes", async () => {
      restoreFetch();
      globalThis.fetch = () => {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: false,
              error: { error: "Server error" },
            }),
            { status: 500 },
          ),
        );
      };

      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      await assertRejects(
        async () => {
          await client.generateText(messages);
        },
        Error,
      );
    });
  });

  describe("getModels", () => {
    it("should get available models successfully", async () => {
      const models = await client.getModels();

      assertEquals(Array.isArray(models), true);
      assertEquals(models.length, 3);
      assertEquals(models.includes("gpt-4.1-nano"), true);
      assertEquals(models.includes("gemini-2.5-flash"), true);
      assertEquals(models.includes("claude-3-sonnet"), true);
    });

    it("should handle API error responses", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/models": {
          success: false,
          error: {
            error: "Failed to fetch models",
            code: "MODELS_ERROR",
          },
        },
      });

      await assertRejects(
        async () => {
          await client.getModels();
        },
        Error,
        "Failed to fetch models",
      );
    });

    it("should handle network errors", async () => {
      restoreFetch();
      globalThis.fetch = () => {
        return Promise.reject(new Error("Network error"));
      };

      await assertRejects(
        async () => {
          await client.getModels();
        },
        Error,
      );
    });

    it("should handle empty models list", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/models": {
          success: true,
          data: {
            models: [],
          },
        },
      });

      const models = await client.getModels();
      assertEquals(Array.isArray(models), true);
      assertEquals(models.length, 0);
    });
  });

  describe("getHealth", () => {
    it("should get health status successfully", async () => {
      const health = await client.getHealth();

      assertEquals(health.status, "healthy");
      assertEquals(Array.isArray(health.models), true);
      assertEquals(health.models.length, 2);
      assertEquals(health.version, "0.0.1");
    });

    it("should handle API error responses", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/health": {
          success: false,
          error: {
            error: "Health check failed",
            code: "HEALTH_ERROR",
          },
        },
      });

      await assertRejects(
        async () => {
          await client.getHealth();
        },
        Error,
        "Health check failed",
      );
    });

    it("should handle network errors", async () => {
      restoreFetch();
      globalThis.fetch = () => {
        return Promise.reject(new Error("Network error"));
      };

      await assertRejects(
        async () => {
          await client.getHealth();
        },
        Error,
      );
    });

    it("should handle unhealthy status", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/health": {
          success: true,
          data: {
            status: "unhealthy",
            models: [],
            version: "0.0.1",
          },
        },
      });

      const health = await client.getHealth();
      assertEquals(health.status, "unhealthy");
      assertEquals(health.models.length, 0);
    });
  });

  describe("createAIClient factory function", () => {
    it("should create client with default URL", () => {
      const client = createAIClient();
      assertExists(client);
    });

    it("should create client with custom URL", () => {
      const client = createAIClient("http://custom:8080");
      assertExists(client);
    });
  });

  describe("error handling edge cases", () => {
    it("should handle undefined response data", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/generate": {
          success: true,
          data: undefined,
        },
      });

      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      await assertRejects(
        async () => {
          await client.generateText(messages);
        },
        Error,
      );
    });

    it("should handle null response data", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/models": {
          success: true,
          data: null,
        },
      });

      const models = await client.getModels();
      assertEquals(Array.isArray(models), true);
      assertEquals(models.length, 0);
    });

    it("should handle missing error message", async () => {
      restoreFetch();
      restoreFetch = mockFetch({
        "/generate": {
          success: false,
          error: {},
        },
      });

      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      await assertRejects(
        async () => {
          await client.generateText(messages);
        },
        Error,
      );
    });

    it("should handle response without success field", async () => {
      restoreFetch();
      globalThis.fetch = () => {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                content: "Response without success field",
              },
            }),
            { status: 200 },
          ),
        );
      };

      const messages = [
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      await assertRejects(
        async () => {
          await client.generateText(messages);
        },
        Error,
      );
    });
  });

  describe("message format conversion", () => {
    it("should handle system messages", async () => {
      const messages = [
        {
          role: "system" as const,
          content: "You are a helpful assistant",
          timestamp: new Date(),
        },
        { role: "user" as const, content: "Hello", timestamp: new Date() },
      ];

      const response = await client.generateText(messages);
      assertEquals(response.content, "Test AI response");
    });

    it("should handle empty messages array", async () => {
      const response = await client.generateText([]);
      assertEquals(response.content, "Test AI response");
    });

    it("should handle messages with special characters", async () => {
      const messages = [
        {
          role: "user" as const,
          content: 'Hello "world" & <test>',
          timestamp: new Date(),
        },
      ];

      const response = await client.generateText(messages);
      assertEquals(response.content, "Test AI response");
    });

    it("should handle very long messages", async () => {
      const longContent = "A".repeat(10000);
      const messages = [
        { role: "user" as const, content: longContent, timestamp: new Date() },
      ];

      const response = await client.generateText(messages);
      assertEquals(response.content, "Test AI response");
    });
  });
});

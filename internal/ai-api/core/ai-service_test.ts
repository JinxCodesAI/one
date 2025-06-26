/**
 * Tests for AI service
 */

import { assertEquals, assertThrows } from "@std/assert";
import { AIService } from "./ai-service.ts";
import type { GenerateObjectRequest, GenerateTextRequest, ServiceConfig } from "../types.ts";

// Mock configuration for testing
const mockConfig: ServiceConfig = {
  port: 8000,
  host: "localhost",
  providers: [
    {
      name: "openai",
      apiKey: "test-openai-key",
    },
  ],
  models: [
    {
      name: "gpt-4.1-nano",
      provider: "openai",
      modelId: "gpt-4.1-nano",
      isDefault: true,
    },
    {
      name: "gemini-2.5-flash",
      provider: "google",
      modelId: "gemini-2.5-flash",
    },
  ],
  defaultModel: "gpt-4.1-nano",
};

Deno.test("AIService - constructor initializes service", () => {
  const service = new AIService(mockConfig);
  assertEquals(service instanceof AIService, true);
});

Deno.test("AIService - getAvailableModels returns model names", () => {
  const service = new AIService(mockConfig);
  const models = service.getAvailableModels();

  assertEquals(models.length, 2);
  assertEquals(models.includes("gpt-4.1-nano"), true);
  assertEquals(models.includes("gemini-2.5-flash"), true);
});

Deno.test("AIService - validateRequest validates valid request", () => {
  const service = new AIService(mockConfig);
  const request: GenerateTextRequest = {
    messages: [
      { role: "user", content: "Hello, world!" },
    ],
  };

  // Should not throw
  service.validateRequest(request);
});

Deno.test("AIService - validateRequest throws for empty messages", () => {
  const service = new AIService(mockConfig);
  const request: GenerateTextRequest = {
    messages: [],
  };

  assertThrows(
    () => service.validateRequest(request),
    Error,
    "At least one message is required",
  );
});

Deno.test("AIService - validateRequest throws for missing messages", () => {
  const service = new AIService(mockConfig);
  const request = {} as GenerateTextRequest;

  assertThrows(
    () => service.validateRequest(request),
    Error,
    "Messages array is required",
  );
});

Deno.test("AIService - validateRequest throws for invalid role", () => {
  const service = new AIService(mockConfig);
  const request = {
    messages: [
      { role: "invalid", content: "Hello" },
    ],
  } as unknown as GenerateTextRequest;

  assertThrows(
    () => service.validateRequest(request),
    Error,
    "Invalid message role",
  );
});

Deno.test("AIService - validateRequest throws for missing content", () => {
  const service = new AIService(mockConfig);
  const request: GenerateTextRequest = {
    messages: [
      { role: "user", content: "" },
    ],
  };

  assertThrows(
    () => service.validateRequest(request),
    Error,
    "Message content is required and must be a string",
  );
});

Deno.test("AIService - validateRequest throws for invalid model", () => {
  const service = new AIService(mockConfig);
  const request: GenerateTextRequest = {
    messages: [
      { role: "user", content: "Hello" },
    ],
    model: "nonexistent-model",
  };

  assertThrows(
    () => service.validateRequest(request),
    Error,
    "Invalid model: nonexistent-model",
  );
});

Deno.test("AIService - validateRequest throws for invalid maxTokens", () => {
  const service = new AIService(mockConfig);
  const request: GenerateTextRequest = {
    messages: [
      { role: "user", content: "Hello" },
    ],
    maxTokens: 5000,
  };

  assertThrows(
    () => service.validateRequest(request),
    Error,
    "maxTokens must be between 1 and 4096",
  );
});

Deno.test("AIService - validateRequest throws for invalid temperature", () => {
  const service = new AIService(mockConfig);
  const request: GenerateTextRequest = {
    messages: [
      { role: "user", content: "Hello" },
    ],
    temperature: 1.5,
  };

  assertThrows(
    () => service.validateRequest(request),
    Error,
    "temperature must be between 0 and 1",
  );
});

Deno.test("AIService - validateGenerateObjectRequest validates valid request", () => {
  const service = new AIService(mockConfig);
  const request: GenerateObjectRequest = {
    messages: [
      { role: "user", content: "Generate a JSON object." },
    ],
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    },
  };

  // Should not throw
  service.validateGenerateObjectRequest(request);
});

Deno.test("AIService - validateGenerateObjectRequest throws for missing schema", () => {
  const service = new AIService(mockConfig);
  const request = {
    messages: [
      { role: "user", content: "Generate a JSON object." },
    ],
  } as unknown as GenerateObjectRequest;

  assertThrows(
    () => service.validateGenerateObjectRequest(request),
    Error,
    "Schema object is required",
  );
});

Deno.test("AIService - validateGenerateObjectRequest throws for unsupported schema type", () => {
  const service = new AIService(mockConfig);
  const request: GenerateObjectRequest = {
    messages: [
      { role: "user", content: "Generate a JSON object." },
    ],
    schema: {
      type: "unsupportedType",
    },
  };

  assertThrows(
    () => service.validateGenerateObjectRequest(request),
    Error,
    "Unsupported JSON schema type: unsupportedType",
  );
});

Deno.test("AIService - getHealth returns health status", () => {
  const service = new AIService(mockConfig);
  const health = service.getHealth();

  assertEquals(typeof health.status, "string");
  assertEquals(Array.isArray(health.models), true);
  assertEquals(health.models.length, 2);
});

/**
 * Tests for configuration management
 */

import { assertEquals, assertThrows } from "@std/assert";
import { loadConfig, validateConfig } from "./config.ts";
import type { ServiceConfig } from "../types.ts";

// Mock environment variables for testing
const mockEnv = new Map<string, string>();

// Override Deno.env.get for testing
const originalEnvGet = Deno.env.get;
function mockEnvGet(key: string): string | undefined {
  return mockEnv.get(key);
}

Deno.test("loadConfig - throws error when no providers configured", () => {
  // Clear all environment variables
  mockEnv.clear();
  Deno.env.get = mockEnvGet;

  assertThrows(
    () => loadConfig(),
    Error,
    "No AI providers configured. Please set at least one of: OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, OPENROUTER_API_KEY"
  );

  // Restore original function
  Deno.env.get = originalEnvGet;
});

Deno.test("loadConfig - loads OpenAI configuration", () => {
  mockEnv.clear();
  mockEnv.set("OPENAI_API_KEY", "test-key");
  Deno.env.get = mockEnvGet;

  const config = loadConfig();
  
  assertEquals(config.providers.length, 1);
  assertEquals(config.providers[0].name, "openai");
  assertEquals(config.providers[0].apiKey, "test-key");

  Deno.env.get = originalEnvGet;
});

Deno.test("loadConfig - loads Google configuration", () => {
  mockEnv.clear();
  mockEnv.set("GOOGLE_GENERATIVE_AI_API_KEY", "test-key");
  Deno.env.get = mockEnvGet;

  const config = loadConfig();

  assertEquals(config.providers.length, 1);
  assertEquals(config.providers[0].name, "google");
  assertEquals(config.providers[0].apiKey, "test-key");

  Deno.env.get = originalEnvGet;
});

Deno.test("loadConfig - loads multiple providers", () => {
  mockEnv.clear();
  mockEnv.set("OPENAI_API_KEY", "openai-key");
  mockEnv.set("GOOGLE_GENERATIVE_AI_API_KEY", "google-key");
  mockEnv.set("OPENROUTER_API_KEY", "openrouter-key");
  Deno.env.get = mockEnvGet;

  const config = loadConfig();

  assertEquals(config.providers.length, 3);
  assertEquals(config.providers.find(p => p.name === "openai")?.apiKey, "openai-key");
  assertEquals(config.providers.find(p => p.name === "google")?.apiKey, "google-key");
  assertEquals(config.providers.find(p => p.name === "openrouter")?.apiKey, "openrouter-key");

  Deno.env.get = originalEnvGet;
});

Deno.test("loadConfig - uses custom port and host", () => {
  mockEnv.clear();
  mockEnv.set("OPENAI_API_KEY", "test-key");
  mockEnv.set("PORT", "3000");
  mockEnv.set("HOST", "127.0.0.1");
  Deno.env.get = mockEnvGet;

  const config = loadConfig();
  
  assertEquals(config.port, 3000);
  assertEquals(config.host, "127.0.0.1");

  Deno.env.get = originalEnvGet;
});

Deno.test("validateConfig - validates valid configuration", () => {
  const config: ServiceConfig = {
    port: 8000,
    host: "localhost",
    providers: [{
      name: "openai",
      apiKey: "test-key",
    }],
    models: [{
      name: "gpt-4.1-nano",
      provider: "openai",
      modelId: "gpt-4.1-nano",
    }],
    defaultModel: "gpt-4.1-nano",
  };

  // Should not throw
  validateConfig(config);
});

Deno.test("validateConfig - throws for missing providers", () => {
  const config: ServiceConfig = {
    port: 8000,
    host: "localhost",
    providers: [],
    models: [],
    defaultModel: "test",
  };

  assertThrows(
    () => validateConfig(config),
    Error,
    "At least one provider must be configured"
  );
});

Deno.test("validateConfig - throws for invalid port", () => {
  const config: ServiceConfig = {
    port: 70000,
    host: "localhost",
    providers: [{
      name: "openai",
      apiKey: "test-key",
    }],
    models: [{
      name: "gpt-4.1-nano",
      provider: "openai",
      modelId: "gpt-4.1-nano",
    }],
    defaultModel: "gpt-4.1-nano",
  };

  assertThrows(
    () => validateConfig(config),
    Error,
    "Port must be between 1 and 65535"
  );
});

Deno.test("validateConfig - throws for missing default model", () => {
  const config: ServiceConfig = {
    port: 8000,
    host: "localhost",
    providers: [{
      name: "openai",
      apiKey: "test-key",
    }],
    models: [{
      name: "gpt-4.1-nano",
      provider: "openai",
      modelId: "gpt-4.1-nano",
    }],
    defaultModel: "nonexistent-model",
  };

  assertThrows(
    () => validateConfig(config),
    Error,
    "Default model 'nonexistent-model' not found in available models"
  );
});

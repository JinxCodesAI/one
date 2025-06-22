/**
 * Test setup utilities for E2E testing
 * Uses in-process server startup for proper fetch mocking
 */

/// <reference lib="deno.ns" />

import { startServer } from "../../../../internal/ai-api/main.ts";
import { createSimpleClient } from "../../../../internal/ai-api/sdk/client.ts";
import { createAIClient } from "../../src/services/aiClient.ts";
import type { AIServer } from "../../../../internal/ai-api/server/server.ts";

/**
 * Test configuration interface
 */
export interface TestConfig {
  port: number;
  aiApiUrl: string;
  timeout: number;
}

/**
 * Test environment interface
 */
export interface TestEnvironment {
  server: AIServer;
  client: ReturnType<typeof createAIClient>;
  aiClient: ReturnType<typeof createSimpleClient>;
  cleanup: () => Promise<void>;
}

/**
 * Create test configuration with unique port
 */
export function createTestConfig(): TestConfig {
  const port = 8000 + Math.floor(Math.random() * 1000);
  return {
    port,
    aiApiUrl: `http://localhost:${port}`,
    timeout: 30000,
  };
}

/**
 * Setup test environment with required environment variables
 */
export function setupTestEnvironment(config: TestConfig): void {
  // Set test environment variables
  Deno.env.set("NODE_ENV", "test");
  Deno.env.set("PORT", config.port.toString());
  Deno.env.set("OPENAI_API_KEY", "test-openai-key");
  Deno.env.set("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");
  Deno.env.set("OPENROUTER_API_KEY", "test-openrouter-key");
}

/**
 * Setup server and client for testing using in-process server
 */
export async function setupServerAndClient(
  config: TestConfig,
): Promise<TestEnvironment> {
  // Start the AI API server in the same process
  const server = await startServer();

  // Give server time to start
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Create clients
  const client = createAIClient(config.aiApiUrl);
  const aiClient = createSimpleClient(config.aiApiUrl, config.timeout);

  const cleanup = async () => {
    try {
      await server.stop();
    } catch (error) {
      console.warn("Error during server cleanup:", error);
    }
  };

  return { server, client, aiClient, cleanup };
}

/**
 * Create a mock scenario for successful AI responses
 */
import type { RequestContext, RequestMetadata } from "./external-mock.ts";
import { RequestAnalyzer } from "./external-mock.ts";

export function createSuccessfulAIScenario(
  responseContent: string = "Hello! How can I help you today?",
) {
  return {
    name: "Successful AI response",
    isRequestExpected: (
      _context: RequestContext,
      metadata: RequestMetadata,
    ) => {
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      const response = RequestAnalyzer.generateSuccessResponse(
        context,
        metadata,
      );

      // Customize response content based on service
      switch (metadata.service) {
        case "openai":
          response.body.choices[0].message.content = responseContent;
          break;
        case "google":
          response.body.candidates[0].content.parts[0].text = responseContent;
          break;
        case "openrouter":
          response.body.choices[0].message.content = responseContent;
          break;
      }

      return response;
    },
  };
}

/**
 * Create a mock scenario for AI service errors
 */
export function createErrorAIScenario(errorType: string = "rate_limit") {
  return {
    name: "AI service error",
    isRequestExpected: (
      _context: RequestContext,
      metadata: RequestMetadata,
    ) => {
      return metadata.isExternalApi &&
        ["openai", "google", "openrouter"].includes(metadata.service);
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      return RequestAnalyzer.generateErrorResponse(
        context,
        metadata,
        errorType,
      );
    },
  };
}

/**
 * Create a mock scenario with network delays
 */
export function createSlowAIScenario(
  delay: number = 2000,
  responseContent: string = "Hello! How can I help you today?",
) {
  return {
    name: "Slow AI response",
    isRequestExpected: (
      _context: RequestContext,
      metadata: RequestMetadata,
    ) => {
      return metadata.isExternalApi &&
        ["openai", "google", "openrouter"].includes(metadata.service);
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      const response = RequestAnalyzer.generateSuccessResponse(
        context,
        metadata,
      );
      response.delay = delay;

      // Customize response content
      switch (metadata.service) {
        case "openai":
          response.body.choices[0].message.content = responseContent;
          break;
        case "google":
          response.body.candidates[0].content.parts[0].text = responseContent;
          break;
        case "openrouter":
          response.body.choices[0].message.content = responseContent;
          break;
      }

      return response;
    },
  };
}

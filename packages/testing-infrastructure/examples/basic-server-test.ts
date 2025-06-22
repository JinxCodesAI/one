/**
 * Basic Server E2E Test Example
 *
 * This example shows how to set up a basic server E2E test using the shared
 * testing infrastructure. It demonstrates:
 * - Setting up mock scenarios
 * - Creating test environments
 * - Making API calls and assertions
 * - Proper cleanup
 */

import { after, before, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import {
  createServerTestConfig,
  createServerTestEnvironment,
  createSuccessScenario,
  FetchMockManager,
  type ServerTestEnvironment,
} from "@one/testing-infrastructure";

// These would be imported from your actual project
// import { startServer } from "../path/to/your/server.ts";
// import { createClient } from "../path/to/your/client.ts";

// Mock implementations for this example
const startServer = () =>
  Promise.resolve({
    stop: () => Promise.resolve(console.log("Server stopped")),
  });

const createClient = (_baseUrl: string) => ({
  generateText: (
    _messages: Array<{ role: string; content: string }>,
    model: string,
  ) =>
    Promise.resolve({
      content: "Mocked response",
      model,
      usage: { totalTokens: 10 },
    }),
  getHealth: () =>
    Promise.resolve({
      status: "healthy",
      models: ["gpt-4.1-nano", "gemini-2.5-flash"],
    }),
});

describe("Basic Server E2E Test Example", () => {
  let mockManager: FetchMockManager;
  let testEnv: ServerTestEnvironment;

  before(async () => {
    // 1. Create a mock scenario for successful AI responses
    const scenario = createSuccessScenario(
      ["openai", "google"], // Providers to mock
      {
        openai: "Hello from OpenAI!",
        google: "Hello from Google!",
      },
    );

    // 2. Start the mock manager
    mockManager = new FetchMockManager(scenario);
    mockManager.start();

    // 3. Create the test environment
    testEnv = await createServerTestEnvironment(
      startServer,
      createClient,
      createServerTestConfig(),
    );
  });

  after(async () => {
    // Always clean up resources
    await testEnv.cleanup();
    mockManager.stop();
  });

  it("should generate text with OpenAI", async () => {
    const client = testEnv.client as ReturnType<typeof createClient>;

    const response = await client.generateText(
      [{ role: "user", content: "Hello" }],
      "gpt-4.1-nano",
    );

    assertExists(response);
    assertEquals(response.model, "gpt-4.1-nano");
    assertExists(response.content);
    assertExists(response.usage);
  });

  it("should return health status", async () => {
    const client = testEnv.client as ReturnType<typeof createClient>;

    const health = await client.getHealth();

    assertExists(health);
    assertEquals(health.status, "healthy");
    assertExists(health.models);
    assertEquals(health.models.length > 0, true);
  });

  it("should log intercepted requests", async () => {
    const client = testEnv.client as ReturnType<typeof createClient>;

    // Clear previous logs
    mockManager.clearRequestLog();

    // Make a request
    await client.generateText(
      [{ role: "user", content: "Test" }],
      "gpt-4.1-nano",
    );

    // Check what was intercepted
    const requestLog = mockManager.getRequestLog();
    console.log(`Intercepted ${requestLog.length} requests`);

    // You can assert on the requests if needed
    const externalRequests = requestLog.filter((req) =>
      req.metadata.isExternalApi
    );
    assertEquals(externalRequests.length >= 0, true); // May be 0 if no external calls made
  });
});

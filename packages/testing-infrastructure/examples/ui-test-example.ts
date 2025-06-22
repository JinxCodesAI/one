/**
 * UI E2E Test Example
 *
 * This example shows how to set up UI E2E tests using the shared testing
 * infrastructure. It demonstrates:
 * - Browser automation setup
 * - Mock scenario configuration for UI tests
 * - Common UI interaction patterns
 * - Screenshot capture for debugging
 */

import { after, before, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import {
  createUISuccessScenario,
  createUITestConfig,
  createUITestEnvironment,
  type UITestEnvironment,
  UITestHelpers,
} from "@one/testing-infrastructure";

// These would be imported from your actual project
// import { startServer } from "../path/to/your/api-server.ts";

// Mock server implementation for this example
const startServer = () =>
  Promise.resolve({
    stop: () => Promise.resolve(console.log("API Server stopped")),
  });

describe("UI E2E Test Example", () => {
  let testEnv: UITestEnvironment;

  before(async () => {
    // 1. Create UI test configuration
    const config = createUITestConfig({
      headless: true, // Set to false to see browser during development
      timeout: 30000,
      customEnvVars: {
        "FEATURE_FLAG_CHAT": "enabled",
      },
    });

    // 2. Create UI success scenario with model-specific responses
    const scenario = createUISuccessScenario(
      "Hello! This is GPT-4.1-nano responding to your message.",
      "Hello! This is Gemini-2.5-flash responding to your message.",
      "Hello! This is Claude-3.5-sonnet responding to your message.",
    );

    // 3. Setup the complete UI test environment
    testEnv = await createUITestEnvironment(
      startServer,
      scenario,
      config,
    );

    console.log("UI test environment ready!");
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("should load the application correctly", async () => {
    const { page } = testEnv;

    // Check if the main elements are present
    await UITestHelpers.waitForElement(
      page,
      "text=Start a conversation by typing a message below",
    );
    await UITestHelpers.waitForElement(page, '[data-testid="model-selector"]');
    await UITestHelpers.waitForElement(page, '[data-testid="message-input"]');
    await UITestHelpers.waitForElement(page, '[data-testid="send-button"]');

    console.log("✅ Application loaded successfully!");
  });

  it("should send a message and receive response", async () => {
    const { page } = testEnv;

    // Type a message
    await UITestHelpers.typeText(
      page,
      '[data-testid="message-input"]',
      "Hello, how are you?",
    );

    // Click send button
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');

    // Wait for assistant response
    await UITestHelpers.waitForMessage(page, "assistant");

    // Get all messages and verify
    const messages = await UITestHelpers.getAllMessages(page);
    assertEquals(messages.length >= 2, true); // User message + assistant response

    const userMessage = messages.find((m) => m.role === "user");
    const assistantMessage = messages.find((m) => m.role === "assistant");

    assertExists(userMessage);
    assertExists(assistantMessage);
    assertEquals(userMessage.content.includes("Hello, how are you?"), true);

    console.log("✅ Message exchange completed successfully!");
  });

  it("should test different models", async () => {
    const { page } = testEnv;

    // Clear any previous conversation
    await UITestHelpers.clearConversation(page);

    // Test OpenAI model
    await UITestHelpers.selectOption(
      page,
      '[data-testid="model-selector"]',
      "gpt-4.1-nano",
    );
    await UITestHelpers.typeText(
      page,
      '[data-testid="message-input"]',
      "Test OpenAI",
    );
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    await UITestHelpers.waitForMessage(page, "assistant");

    let messages = await UITestHelpers.getAllMessages(page);
    let assistantMessage = messages.find((m) => m.role === "assistant");
    assertExists(assistantMessage);
    assertEquals(assistantMessage.content.includes("GPT-4.1-nano"), true);

    // Clear conversation
    await UITestHelpers.clearConversation(page);

    // Test Google model
    await UITestHelpers.selectOption(
      page,
      '[data-testid="model-selector"]',
      "gemini-2.5-flash",
    );
    await UITestHelpers.typeText(
      page,
      '[data-testid="message-input"]',
      "Test Google",
    );
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    await UITestHelpers.waitForMessage(page, "assistant");

    messages = await UITestHelpers.getAllMessages(page);
    assistantMessage = messages.find((m) => m.role === "assistant");
    assertExists(assistantMessage);
    assertEquals(assistantMessage.content.includes("Gemini-2.5-flash"), true);

    console.log("✅ Multiple model testing completed!");
  });

  it("should handle loading states", async () => {
    const { page } = testEnv;

    // Clear conversation
    await UITestHelpers.clearConversation(page);

    // Send message and check for loading state
    await UITestHelpers.typeText(
      page,
      '[data-testid="message-input"]',
      "Test loading",
    );
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');

    // Wait for loading to complete
    await UITestHelpers.waitForLoadingComplete(page);

    // Verify response appeared
    await UITestHelpers.waitForMessage(page, "assistant");

    console.log("✅ Loading state handling verified!");
  });

  it("should take screenshot for debugging", async () => {
    const { page } = testEnv;

    // Take a screenshot of the current state
    await UITestHelpers.takeScreenshot(page, "final-state");

    console.log("✅ Screenshot captured for debugging!");
  });
});

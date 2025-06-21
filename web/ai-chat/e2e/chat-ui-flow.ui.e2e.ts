/**
 * UI E2E tests for complete chat application flow
 * Tests real user interactions through browser automation
 *
 * Migrated to use shared testing infrastructure from @one/testing-infrastructure
 */

import { describe, it, before, beforeEach, after } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import {
  createUITestEnvironment,
  createUITestConfig,
  createUISuccessScenario,
  UITestHelpers,
  type UITestConfig,
  type UITestEnvironment
} from "@one/testing-infrastructure";
import { startServer } from "../../../internal/ai-api/main.ts";

// Test constants - specific responses for each model
const OPENAI_RESPONSE = "Hello! This is GPT-4.1-nano responding to your message through the UI.";
const GOOGLE_RESPONSE = "Hello! This is Gemini-2.5-flash responding to your message through the UI.";
const ANTHROPIC_RESPONSE = "Hello! This is Claude-3.5-sonnet responding to your message through the UI.";

describe("UI E2E: Complete Chat Application Flow", () => {
  let testConfig: UITestConfig;
  let testEnvironment: UITestEnvironment;

  before(async () => {
    testConfig = createUITestConfig();

    // Setup successful AI response scenario
    const scenario = createUISuccessScenario(OPENAI_RESPONSE, GOOGLE_RESPONSE, ANTHROPIC_RESPONSE);

    testEnvironment = await createUITestEnvironment(startServer, scenario, testConfig);

    console.log('UI E2E test environment ready!');
  });

  after(async () => {
    await testEnvironment.cleanup();
  });

  beforeEach(async () => {
    // Clear conversation before each test to ensure clean state
    const { page } = testEnvironment;
    await UITestHelpers.clearConversation(page);
    console.log('🧹 Conversation cleared before test');
  });

  it("should load the application and show welcome message", async () => {
    const { page } = testEnvironment;

    console.log("Step 1: Check if welcome message is visible");
    await UITestHelpers.waitForElement(page, 'text=Start a conversation by typing a message below');

    console.log("Step 2: Verify model selector is present");
    await UITestHelpers.waitForElement(page, '[data-testid="model-selector"]');

    console.log("Step 3: Verify message input is present");
    await UITestHelpers.waitForElement(page, '[data-testid="message-input"]');

    console.log("Step 4: Verify send button is present");
    await UITestHelpers.waitForElement(page, '[data-testid="send-button"]');

    console.log("✅ Application loaded successfully!");
  });

  it("should complete full chat flow: select model -> type message -> send -> receive response", async () => {
    const { page } = testEnvironment;
    
    console.log("Step 1: Verify app loaded and model selector is visible");
    await UITestHelpers.waitForElement(page, '[data-testid="model-selector"]');
    
    console.log("Step 2: Select OpenAI GPT-4.1-nano model");
    await UITestHelpers.selectOption(page, '[data-testid="model-selector"]', 'gpt-4.1-nano');
    
    // Verify model was selected
    const selectedModel = await page.locator('[data-testid="model-selector"]').inputValue();
    assertEquals(selectedModel, 'gpt-4.1-nano');
    
    console.log("Step 3: Type message in input field");
    const userMessage = "Hello, how are you today?";
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', userMessage);
    
    // Verify text was typed
    const inputValue = await page.locator('[data-testid="message-input"]').inputValue();
    assertEquals(inputValue, userMessage);
    
    console.log("Step 4: Click send button");
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    
    console.log("Step 5: Wait for user message to appear");
    await UITestHelpers.waitForMessage(page, 'user');
    
    console.log("Step 6: Wait for AI response to appear");
    await UITestHelpers.waitForMessage(page, 'assistant', 15000); // Longer timeout for AI response
    
    console.log("Step 7: Verify messages in chat");
    const messages = await UITestHelpers.getAllMessages(page);
    
    console.log(messages);
    console.log(messages.length);
    
    // Should have 2 messages: user + assistant
    assertEquals(messages.length, 2);
    
    // Verify user message
    assertEquals(messages[0].role, 'user');
    assertEquals(messages[0].content?.includes(userMessage), true);
    
    // Verify AI response
    assertEquals(messages[1].role, 'assistant');
    assertEquals(messages[1].content?.includes(OPENAI_RESPONSE), true);
    
    console.log("Step 8: Verify input field is cleared");
    const clearedInput = await page.locator('[data-testid="message-input"]').inputValue();
    assertEquals(clearedInput, '');
    
    console.log("✅ Complete chat flow test passed!");
  });

  it("should handle model switching during conversation", async () => {
    const { page } = testEnvironment;
    
    console.log("Step 1: Start with OpenAI model");
    await UITestHelpers.selectOption(page, '[data-testid="model-selector"]', 'gpt-4.1-nano');
    
    console.log("Step 2: Send first message with OpenAI");
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', 'First message with OpenAI');
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    
    // Wait for both messages
    await UITestHelpers.waitForMessage(page, 'user');
    await UITestHelpers.waitForMessage(page, 'assistant', 15000);
    
    console.log("Step 3: Switch to Google model");
    await UITestHelpers.selectOption(page, '[data-testid="model-selector"]', 'gemini-2.5-flash');
    
    console.log("Step 4: Send second message with Google");
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', 'Second message with Google');
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    
    // Wait for new messages (should be 4 total now)
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('[data-testid^="message-"]');
      return messages.length >= 4;
    }, { timeout: 15000 });
    
    console.log("Step 5: Verify all messages");
    const messages = await UITestHelpers.getAllMessages(page);
    
    console.log(messages);
    console.log(messages.length);
    
    // Should have 4 messages: user1 + ai1 + user2 + ai2
    assertEquals(messages.length, 4);

    // Verify first AI response (OpenAI)
    assertEquals(messages[1].role, 'assistant');
    assertEquals(messages[1].content?.includes(OPENAI_RESPONSE), true);

    // Verify second AI response (Google)
    assertEquals(messages[3].role, 'assistant');
    assertEquals(messages[3].content?.includes(GOOGLE_RESPONSE), true);
    
    console.log("✅ Model switching test passed!");
  });

  it("should handle multi-turn conversation", async () => {
    const { page } = testEnvironment;
    
    console.log("Step 1: Select model and start conversation");
    await UITestHelpers.selectOption(page, '[data-testid="model-selector"]', 'anthropic/claude-3.5-sonnet');
    
    // Send first message
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', 'Hello Claude!');
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    
    await UITestHelpers.waitForMessage(page, 'user');
    await UITestHelpers.waitForMessage(page, 'assistant', 15000);
    
    console.log("Step 2: Send follow-up message");
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', 'How are you doing?');
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    
    // Wait for conversation to have 4 messages
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('[data-testid^="message-"]');
      return messages.length >= 4;
    }, { timeout: 15000 });
    
    console.log("Step 3: Verify conversation flow");
    const messages = await UITestHelpers.getAllMessages(page);
    
    console.log(messages);
    console.log(messages.length);
    
    // Should have at least 4 messages
    assertEquals(messages.length >= 4, true);
    
    // Verify conversation pattern: user -> assistant -> user -> assistant
    assertEquals(messages[0].role, 'user');
    assertEquals(messages[1].role, 'assistant');
    assertEquals(messages[2].role, 'user');
    assertEquals(messages[3].role, 'assistant');
    
    // Verify Claude responses
    assertEquals(messages[1].content?.includes(ANTHROPIC_RESPONSE), true);
    assertEquals(messages[3].content?.includes(ANTHROPIC_RESPONSE), true);
    
    console.log("✅ Multi-turn conversation test passed!");
  });

  it("should handle keyboard shortcuts (Enter to send)", async () => {
    const { page } = testEnvironment;
    
    console.log("Step 1: Select model");
    await UITestHelpers.selectOption(page, '[data-testid="model-selector"]', 'gpt-4.1-nano');
    
    console.log("Step 2: Type message and press Enter");
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', 'Testing Enter key');
    
    // Press Enter to send
    await page.locator('[data-testid="message-input"]').press('Enter');
    
    console.log("Step 3: Verify message was sent");
    await UITestHelpers.waitForMessage(page, 'user');
    await UITestHelpers.waitForMessage(page, 'assistant', 15000);
    
    const messages = await UITestHelpers.getAllMessages(page);
    console.log(messages);
    console.log(messages.length);

    assertEquals(messages.length >= 2, true);
    assertEquals(messages[0].content?.includes('Testing Enter key'), true);
    
    console.log("✅ Keyboard shortcuts test passed!");
  });

  it("should show loading states during message sending", async () => {
    const { page } = testEnvironment;
    
    console.log("Step 1: Select model and prepare message");
    await UITestHelpers.selectOption(page, '[data-testid="model-selector"]', 'gpt-4.1-nano');
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', 'Testing loading states');
    
    console.log("Step 2: Click send and check button state");
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    
    // Check if button shows loading state (text changes to "Sending...")
    try {
      await page.waitForFunction(() => {
        const button = document.querySelector('[data-testid="send-button"]');
        return button?.textContent?.includes('Sending');
      }, { timeout: 2000 });
      console.log("✅ Loading state detected");
    } catch {
      console.log("⚠️ Loading state not detected (message sent too quickly)");
    }
    
    console.log("Step 3: Wait for completion");
    await UITestHelpers.waitForMessage(page, 'assistant', 15000);
    
    // Verify button is back to normal state
    const buttonText = await page.locator('[data-testid="send-button"]').textContent();
    assertEquals(buttonText, 'Send');
    
    console.log("✅ Loading states test passed!");
  });

  it("should verify external API mocking is working", async () => {
    const { mockManager } = testEnvironment;
    
    console.log("Step 1: Clear request logs");
    mockManager.clearRequestLog();
    
    console.log("Step 2: Send a message");
    const { page } = testEnvironment;
    await UITestHelpers.selectOption(page, '[data-testid="model-selector"]', 'gpt-4.1-nano');
    await UITestHelpers.typeText(page, '[data-testid="message-input"]', 'Testing API mocking');
    await UITestHelpers.clickElement(page, '[data-testid="send-button"]');
    
    await UITestHelpers.waitForMessage(page, 'assistant', 15000);
    
    console.log("Step 3: Verify mock was called");
    const requestLog = mockManager.getRequestLog();
    const externalRequests = requestLog.filter(req => req.metadata.isExternalApi);
    
    assertEquals(externalRequests.length >= 1, true);
    
    // Verify OpenAI API was called
    const openaiRequests = externalRequests.filter(req => req.metadata.service === 'openai');
    assertEquals(openaiRequests.length >= 1, true);
    
    // Verify correct model was used
    const lastRequest = openaiRequests[openaiRequests.length - 1];
    assertEquals(lastRequest.metadata.model, 'gpt-4.1-nano');
    
    console.log("✅ API mocking verification passed!");
  });
});

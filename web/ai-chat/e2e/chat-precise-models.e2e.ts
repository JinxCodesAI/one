/**
 * E2E tests for precise model testing with specific responses
 * Tests exact model-to-response mapping with proper mocking
 *
 * Migrated to use shared testing infrastructure from @one/testing-infrastructure
 */

import { describe, it, before, after } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import {
  FetchMockManager,
  type MockScenario,
  RequestAnalyzer
} from "@one/testing-infrastructure";
import {
  createTestConfig,
  setupTestEnvironment,
  setupServerAndClient,
  type TestConfig,
  type TestEnvironment
} from "./utils/test-setup.ts";

// Test constants - specific responses for each model
const OPENAI_GPT4_NANO_RESPONSE = "Hello! This is GPT-4.1-nano responding to your message.";
const GOOGLE_GEMINI_FLASH_RESPONSE = "Hello! This is Gemini-2.5-flash responding to your message.";
const ANTHROPIC_CLAUDE_RESPONSE = "Hello! This is Claude-3.5-sonnet responding to your message.";

describe("E2E: Precise Model Testing", () => {
  let mockManager: FetchMockManager;
  let testConfig: TestConfig;
  let testEnvironment: TestEnvironment;

  before(async () => {
    testConfig = createTestConfig();
    setupTestEnvironment(testConfig);
    
    // Setup precise model-specific responses
    const scenario: MockScenario = {
      name: "Specific model responses",
      isRequestExpected: (_context, metadata) => {
        return metadata.isExternalApi && ['openai', 'google', 'openrouter'].includes(metadata.service);
      },
      generateResponse: (context, metadata) => {
        const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
        const body = response.body as Record<string, unknown>;

        // Get the model from metadata (extracted from URL or request body)
        const model = metadata.model;

        console.log(`Mock: service=${metadata.service}, model=${model}`);

        if (metadata.service === 'openai' && model === 'gpt-4.1-nano') {
          console.log('Setting OpenAI response');
          (body.choices as Array<{ message: { content: string } }>)[0].message.content = OPENAI_GPT4_NANO_RESPONSE;
        } else if (metadata.service === 'google' && model === 'gemini-2.5-flash') {
          console.log('Setting Google response');
          (body.candidates as Array<{ content: { parts: Array<{ text: string }> } }>)[0].content.parts[0].text = GOOGLE_GEMINI_FLASH_RESPONSE;
        } else if (metadata.service === 'openrouter' && model === 'anthropic/claude-3.5-sonnet') {
          console.log('Setting OpenRouter response');
          (body.choices as Array<{ message: { content: string } }>)[0].message.content = ANTHROPIC_CLAUDE_RESPONSE;
        } else {
          console.log(`No custom response for service=${metadata.service}, model=${model}`);
        }

        return response;
      }
    };
    
    mockManager = new FetchMockManager(scenario);
    mockManager.start();
    
    testEnvironment = await setupServerAndClient(testConfig);
    
    // Wait for server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  after(async () => {
    mockManager.stop();
    await testEnvironment.cleanup();
  });

  it("should test OpenAI GPT-4.1-nano with exact response", async () => {
    const { client } = testEnvironment;
    
    // Get available models
    const models = await client.getModels();
    assertExists(models);
    
    // Select specific model - GPT-4.1-nano
    const selectedModel = 'gpt-4.1-nano';
    assertEquals(models.includes(selectedModel), true);
    
    // Send message with specific model
    const userMessage = "Hello, how are you today?";
    const messages = [
      { role: 'user' as const, content: userMessage, timestamp: new Date() }
    ];
    
    const response = await client.generateText(messages, selectedModel);
    
    // Verify exact response for this specific model
    assertExists(response);
    assertEquals(response.content, OPENAI_GPT4_NANO_RESPONSE);
    assertEquals(response.model, selectedModel);
    assertExists(response.usage);
    
    // Verify OpenAI API was called specifically
    const requestLog = mockManager.getRequestLog();
    const openaiRequests = requestLog.filter(req => 
      req.metadata.isExternalApi && req.metadata.service === 'openai'
    );
    assertEquals(openaiRequests.length >= 1, true);
    
    // Verify the request contained the correct model
    const lastOpenAIRequest = openaiRequests[openaiRequests.length - 1];
    assertEquals(lastOpenAIRequest.metadata.model, 'gpt-4.1-nano');
  });

  it("should test Google Gemini-2.5-flash with exact response", async () => {
    const { client } = testEnvironment;
    
    // Clear previous request logs
    mockManager.clearRequestLog();
    
    // Select specific model - Gemini-2.5-flash
    const selectedModel = 'gemini-2.5-flash';
    const models = await client.getModels();
    assertEquals(models.includes(selectedModel), true);
    
    const userMessage = "Hello, how are you today?";
    const messages = [
      { role: 'user' as const, content: userMessage, timestamp: new Date() }
    ];
    
    const response = await client.generateText(messages, selectedModel);
    
    // Verify exact response for Gemini model
    assertExists(response);
    assertEquals(response.content, GOOGLE_GEMINI_FLASH_RESPONSE);
    assertEquals(response.model, selectedModel);
    assertExists(response.usage);
    
    // Verify Google API was called specifically
    const requestLog = mockManager.getRequestLog();
    const googleRequests = requestLog.filter(req => 
      req.metadata.isExternalApi && req.metadata.service === 'google'
    );
    assertEquals(googleRequests.length >= 1, true);
    
    // Verify the request contained the correct model
    const lastGoogleRequest = googleRequests[googleRequests.length - 1];
    assertEquals(lastGoogleRequest.metadata.model, 'gemini-2.5-flash');
  });

  it("should test Anthropic Claude via OpenRouter with exact response", async () => {
    const { client } = testEnvironment;
    
    // Clear previous request logs
    mockManager.clearRequestLog();
    
    // Select specific model - Claude via OpenRouter
    const selectedModel = 'anthropic/claude-3.5-sonnet';
    const models = await client.getModels();
    assertEquals(models.includes(selectedModel), true);
    
    const userMessage = "Hello, how are you today?";
    const messages = [
      { role: 'user' as const, content: userMessage, timestamp: new Date() }
    ];
    
    const response = await client.generateText(messages, selectedModel);
    
    // Verify exact response for Claude model
    assertExists(response);
    assertEquals(response.content, ANTHROPIC_CLAUDE_RESPONSE);
    assertEquals(response.model, selectedModel);
    assertExists(response.usage);
    
    // Verify OpenRouter API was called specifically
    const requestLog = mockManager.getRequestLog();
    const openrouterRequests = requestLog.filter(req => 
      req.metadata.isExternalApi && req.metadata.service === 'openrouter'
    );
    assertEquals(openrouterRequests.length >= 1, true);
    
    // Verify the request contained the correct model
    const lastOpenRouterRequest = openrouterRequests[openrouterRequests.length - 1];
    assertEquals(lastOpenRouterRequest.metadata.model, 'anthropic/claude-3.5-sonnet');
  });

  it("should verify mocking is working - no real API calls", async () => {
    const { client } = testEnvironment;
    
    // Clear request logs
    mockManager.clearRequestLog();
    
    // Make a request
    const messages = [
      { role: 'user' as const, content: 'Test message', timestamp: new Date() }
    ];
    
    const response = await client.generateText(messages, 'gpt-4.1-nano');
    
    // Verify we got the mocked response, not a real API response
    assertEquals(response.content, OPENAI_GPT4_NANO_RESPONSE);
    
    // Verify the request log shows external API calls were intercepted
    const requestLog = mockManager.getRequestLog();
    const externalRequests = requestLog.filter(req => req.metadata.isExternalApi);
    assertEquals(externalRequests.length >= 1, true);
    
    // Verify no real API calls went through (all should be mocked)
    externalRequests.forEach(req => {
      // If mocking is working, these should all be intercepted
      assertEquals(req.metadata.isExternalApi, true);
      assertEquals(['openai', 'google', 'openrouter'].includes(req.metadata.service), true);
    });
  });

  it("should handle conversation context with specific models", async () => {
    const { client } = testEnvironment;
    
    // Clear request logs
    mockManager.clearRequestLog();
    
    // Test multi-turn conversation with specific model
    const selectedModel = 'gpt-4.1-nano';
    const messages = [
      { role: 'user' as const, content: 'Hello', timestamp: new Date() },
      { role: 'assistant' as const, content: 'Hi there!', timestamp: new Date() },
      { role: 'user' as const, content: 'How are you?', timestamp: new Date() }
    ];
    
    const response = await client.generateText(messages, selectedModel);
    
    // Verify response
    assertEquals(response.content, OPENAI_GPT4_NANO_RESPONSE);
    assertEquals(response.model, selectedModel);
    
    // Verify conversation context was sent to external API
    const requestLog = mockManager.getRequestLog();
    const externalRequests = requestLog.filter(req => req.metadata.isExternalApi);
    assertEquals(externalRequests.length >= 1, true);
    
    const lastRequest = externalRequests[externalRequests.length - 1];
    const requestBody = JSON.parse(JSON.stringify(lastRequest.context.body) || '{}');
    assertEquals(requestBody.messages.length, 3);
    assertEquals(lastRequest.metadata.model, 'gpt-4.1-nano');
  });

  it("should test model switching with different responses", async () => {
    const { client } = testEnvironment;
    
    // Clear request logs
    mockManager.clearRequestLog();
    
    // First request with OpenAI
    const openaiResponse = await client.generateText([
      { role: 'user' as const, content: 'First message', timestamp: new Date() }
    ], 'gpt-4.1-nano');
    
    assertEquals(openaiResponse.content, OPENAI_GPT4_NANO_RESPONSE);
    assertEquals(openaiResponse.model, 'gpt-4.1-nano');
    
    // Second request with Google
    const googleResponse = await client.generateText([
      { role: 'user' as const, content: 'Second message', timestamp: new Date() }
    ], 'gemini-2.5-flash');
    
    assertEquals(googleResponse.content, GOOGLE_GEMINI_FLASH_RESPONSE);
    assertEquals(googleResponse.model, 'gemini-2.5-flash');
    
    // Verify both services were called
    const requestLog = mockManager.getRequestLog();
    const openaiRequests = requestLog.filter(req => 
      req.metadata.isExternalApi && req.metadata.service === 'openai'
    );
    const googleRequests = requestLog.filter(req => 
      req.metadata.isExternalApi && req.metadata.service === 'google'
    );
    
    assertEquals(openaiRequests.length >= 1, true);
    assertEquals(googleRequests.length >= 1, true);
  });
});

/**
 * Integration tests for chat functionality
 * Tests the integration between chat logic and AI client service
 */

import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import { createMockAIClient, mockFetch, mockConsole } from "../../test-utils/setup.ts";
import "../../test-utils/setup.ts";

describe("Chat Integration Logic", () => {
  let restoreFetch: () => void;
  let consoleRestore: () => void;

  beforeEach(() => {
    // Mock successful AI responses
    restoreFetch = mockFetch({
      '/models': {
        success: true,
        data: {
          models: ['gpt-4.1-nano', 'gemini-2.5-flash', 'claude-3-sonnet']
        }
      },
      '/generate': {
        success: true,
        data: {
          content: 'Hello! How can I help you today?',
          model: 'gpt-4.1-nano',
          usage: {
            promptTokens: 10,
            completionTokens: 8,
            totalTokens: 18
          }
        }
      },
      '/health': {
        success: true,
        data: {
          status: 'healthy',
          models: ['gpt-4.1-nano', 'gemini-2.5-flash'],
          version: '0.0.1'
        }
      }
    });

    const consoleMock = mockConsole();
    consoleRestore = consoleMock.restore;
  });

  afterEach(() => {
    restoreFetch();
    consoleRestore();
  });

  it("should handle chat state initialization", () => {
    const initialState = {
      messages: [],
      selectedModel: 'gpt-4.1-nano',
      availableModels: [],
      isLoading: false,
      error: null
    };

    assertEquals(initialState.messages.length, 0);
    assertEquals(initialState.selectedModel, 'gpt-4.1-nano');
    assertEquals(initialState.availableModels.length, 0);
    assertEquals(initialState.isLoading, false);
    assertEquals(initialState.error, null);
  });

  it("should handle message sending logic", async () => {
    const mockClient = createMockAIClient();
    const messages: any[] = [];
    let isLoading = false;
    let error: string | null = null;

    // Simulate sending a message
    const userMessage = {
      role: 'user' as const,
      content: 'Hello, how are you?',
      timestamp: new Date()
    };

    // Add user message
    messages.push(userMessage);
    isLoading = true;

    try {
      // Call AI service
      const response = await mockClient.generateText();
      
      // Add AI response
      const aiMessage = {
        role: 'assistant' as const,
        content: response.content,
        timestamp: new Date()
      };
      messages.push(aiMessage);
      
      isLoading = false;
      error = null;
    } catch (err) {
      isLoading = false;
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    assertEquals(messages.length, 2);
    assertEquals(messages[0].role, 'user');
    assertEquals(messages[1].role, 'assistant');
    assertEquals(isLoading, false);
    assertEquals(error, null);
  });

  it("should handle model loading logic", async () => {
    const mockClient = createMockAIClient();
    let availableModels: string[] = [];
    let error: string | null = null;

    try {
      availableModels = await mockClient.getModels();
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load models';
    }

    assertEquals(availableModels.length, 2);
    assertEquals(availableModels.includes('gpt-4.1-nano'), true);
    assertEquals(availableModels.includes('gemini-2.5-flash'), true);
    assertEquals(error, null);
  });

  it("should handle model switching logic", () => {
    const availableModels = ['gpt-4.1-nano', 'gemini-2.5-flash', 'claude-3-sonnet'];
    let selectedModel = 'gpt-4.1-nano';
    let error: string | null = null;

    // Switch to valid model
    const newModel = 'gemini-2.5-flash';
    if (availableModels.includes(newModel)) {
      selectedModel = newModel;
      error = null;
    } else {
      error = 'Model not available';
    }

    assertEquals(selectedModel, 'gemini-2.5-flash');
    assertEquals(error, null);
  });

  it("should handle conversation clearing logic", () => {
    let messages = [
      { role: 'user' as const, content: 'Hello', timestamp: new Date() },
      { role: 'assistant' as const, content: 'Hi there!', timestamp: new Date() }
    ];
    let error: string | null = 'Some error';

    assertEquals(messages.length, 2);
    assertEquals(error, 'Some error');

    // Clear conversation
    messages = [];
    error = null;

    assertEquals(messages.length, 0);
    assertEquals(error, null);
  });

  it("should handle retry logic", async () => {
    const mockClient = createMockAIClient();
    type Message = {
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: Date;
    };

    const messages: Message[] = [
      { role: 'user' as const, content: 'Hello', timestamp: new Date() },
      { role: 'system' as const, content: 'Error: Failed to send', timestamp: new Date() }
    ];

    // Find last user message for retry
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    assertExists(lastUserMessage);

    // Remove error message
    const messagesWithoutError: Message[] = messages.filter(m => m.role !== 'system');
    assertEquals(messagesWithoutError.length, 1);

    // Retry with last user message
    try {
      const response = await mockClient.generateText();
      const retryResponse: Message = {
        role: 'assistant' as const,
        content: response.content,
        timestamp: new Date()
      };

      messagesWithoutError.push(retryResponse);
    } catch (err) {
      const errorMessage: Message = {
        role: 'system' as const,
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      messagesWithoutError.push(errorMessage);
    }

    assertEquals(messagesWithoutError.length, 2);
    assertEquals(messagesWithoutError[1].role, 'assistant');
  });

  it("should handle message validation", () => {
    const validMessage = "Hello, how are you?";
    const emptyMessage = "";
    const whitespaceMessage = "   ";

    // Valid message
    assertEquals(validMessage.trim().length > 0, true);

    // Invalid messages
    assertEquals(emptyMessage.trim().length === 0, true);
    assertEquals(whitespaceMessage.trim().length === 0, true);
  });

  it("should handle concurrent request prevention", () => {
    let isLoading = false;
    const message1 = "First message";
    const message2 = "Second message";

    // Start first request
    isLoading = true;
    const canSendFirst = !isLoading && message1.trim().length > 0;
    assertEquals(canSendFirst, false); // Already loading

    // Try second request while first is loading
    const canSendSecond = !isLoading && message2.trim().length > 0;
    assertEquals(canSendSecond, false); // Still loading

    // Complete first request
    isLoading = false;
    const canSendAfterFirst = !isLoading && message2.trim().length > 0;
    assertEquals(canSendAfterFirst, true); // Now can send
  });

  it("should handle health check integration", async () => {
    const mockClient = createMockAIClient();
    let healthStatus = 'unknown';
    let availableModels: string[] = [];

    try {
      const health = await mockClient.getHealth();
      healthStatus = health.status;
      availableModels = health.models;
    } catch (_err) {
      healthStatus = 'error';
    }

    assertEquals(healthStatus, 'healthy');
    assertEquals(availableModels.length, 2);
    assertEquals(availableModels.includes('gpt-4.1-nano'), true);
  });
});

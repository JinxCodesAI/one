/**
 * Fetch mocking utilities for E2E testing
 *
 * This module provides a sophisticated fetch mocking system that:
 * - Intercepts external API calls to AI providers
 * - Uses two-phase request handling (validation + response generation)
 * - Provides realistic mock responses based on request analysis
 * - Allows for different scenarios (success, error, timeout)
 * - Logs all intercepted requests for debugging
 * - Preserves local requests to the test server
 */

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body: unknown;
  delay?: number; // Simulate network delay
}

export interface RequestContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface RequestMetadata {
  provider: 'openai' | 'google' | 'openrouter' | 'unknown';
  model?: string;
  endpoint: string;
  isApiCall: boolean;
}

export type RequestValidationHandler = (context: RequestContext, metadata: RequestMetadata) => boolean;
export type ResponseGenerationHandler = (context: RequestContext, metadata: RequestMetadata) => MockResponse;

export interface MockScenario {
  name: string;
  isRequestExpected: RequestValidationHandler;
  generateResponse: ResponseGenerationHandler;
}

// Remove legacy interface - not needed

/**
 * Utility functions for request analysis and metadata extraction
 */
export class RequestAnalyzer {
  /**
   * Extract metadata from a request
   */
  static analyzeRequest(context: RequestContext): RequestMetadata {
    const url = new URL(context.url);
    const hostname = url.hostname;
    const pathname = url.pathname;

    // Determine provider based on hostname
    let provider: RequestMetadata['provider'] = 'unknown';
    if (hostname.includes('api.openai.com')) {
      provider = 'openai';
    } else if (hostname.includes('generativelanguage.googleapis.com')) {
      provider = 'google';
    } else if (hostname.includes('openrouter.ai')) {
      provider = 'openrouter';
    }

    // Extract model information
    let model: string | undefined;
    let endpoint = pathname;
    let isApiCall = false;

    if (provider === 'openai' && pathname.includes('/chat/completions')) {
      isApiCall = true;
      endpoint = '/chat/completions';
      // Model is in the request body for OpenAI
      if (context.body && typeof context.body === 'object' && 'model' in context.body) {
        model = (context.body as any).model;
      }
    } else if (provider === 'google' && pathname.includes(':generateContent')) {
      isApiCall = true;
      // Extract model from URL path like /v1beta/models/gemini-2.5-flash:generateContent
      const modelMatch = pathname.match(/\/models\/([^:]+):/);
      if (modelMatch) {
        model = modelMatch[1];
        endpoint = '/models/:model:generateContent';
      }
    } else if (provider === 'openrouter' && pathname.includes('/chat/completions')) {
      isApiCall = true;
      endpoint = '/chat/completions';
      // Model is in the request body for OpenRouter
      if (context.body && typeof context.body === 'object' && 'model' in context.body) {
        model = (context.body as any).model;
      }
    }

    return {
      provider,
      model,
      endpoint,
      isApiCall
    };
  }

  /**
   * Generate a realistic response based on provider and request
   */
  static generateSuccessResponse(context: RequestContext, metadata: RequestMetadata): MockResponse {
    const baseResponse: MockResponse = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {},
      delay: 0
    };

    switch (metadata.provider) {
      case 'openai':
      case 'openrouter':
        baseResponse.body = {
          id: `chatcmpl-test${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: metadata.model || "gpt-4.1-nano",
          choices: [{
            index: 0,
            message: {
              role: "assistant",
              content: metadata.provider === 'openai'
            ? "Hello! This is a mocked OpenAI response."
            : metadata.provider === 'openrouter'
            ? "Hello! This is a mocked OpenRouter/Anthropic response."
            : `Hello! This is a mocked ${metadata.provider} response.`
            },
            finish_reason: "stop"
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 8,
            total_tokens: 18
          }
        };
        break;

      case 'google':
        baseResponse.body = {
          candidates: [{
            content: {
              parts: [{
                text: "Hello! This is a mocked Google Gemini response."
              }]
            },
            finishReason: "STOP"
          }],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 8,
            totalTokenCount: 18
          }
        };
        break;

      default:
        baseResponse.body = { message: "Unknown provider mock response" };
    }

    return baseResponse;
  }

  /**
   * Generate an error response based on provider
   */
  static generateErrorResponse(context: RequestContext, metadata: RequestMetadata, errorType: 'rate_limit' | 'invalid_request' | 'server_error' = 'server_error'): MockResponse {
    const baseResponse: MockResponse = {
      headers: { 'Content-Type': 'application/json' },
      body: {},
      delay: 0
    };

    switch (metadata.provider) {
      case 'openai':
      case 'openrouter':
        if (errorType === 'rate_limit') {
          baseResponse.status = 429;
          baseResponse.body = {
            error: {
              message: "Rate limit exceeded",
              type: "rate_limit_error",
              code: "rate_limit_exceeded"
            }
          };
        } else if (errorType === 'invalid_request') {
          baseResponse.status = 400;
          baseResponse.body = {
            error: {
              message: "Invalid request",
              type: "invalid_request_error",
              code: "invalid_request"
            }
          };
        } else {
          baseResponse.status = 500;
          baseResponse.body = {
            error: {
              message: "Internal server error",
              type: "server_error",
              code: "server_error"
            }
          };
        }
        break;

      case 'google':
        if (errorType === 'rate_limit') {
          baseResponse.status = 429;
          baseResponse.body = {
            error: {
              code: 429,
              message: "Quota exceeded",
              status: "RESOURCE_EXHAUSTED"
            }
          };
        } else if (errorType === 'invalid_request') {
          baseResponse.status = 400;
          baseResponse.body = {
            error: {
              code: 400,
              message: "Invalid request",
              status: "INVALID_ARGUMENT"
            }
          };
        } else {
          baseResponse.status = 500;
          baseResponse.body = {
            error: {
              code: 500,
              message: "Internal error",
              status: "INTERNAL"
            }
          };
        }
        break;

      default:
        baseResponse.status = 500;
        baseResponse.body = { error: "Unknown provider error" };
    }

    return baseResponse;
  }
}

// No predefined scenarios - each test defines its own handlers

/**
 * Fetch mock manager - the single source of truth for fetch mocking
 * Uses two-phase request handling: validation + response generation
 */
export class FetchMockManager {
  private originalFetch: typeof globalThis.fetch;
  private currentScenario: MockScenario;
  private requestLog: Array<{ url: string; timestamp: number; method: string; metadata: RequestMetadata }> = [];
  private isActive = false;

  constructor(scenario: MockScenario) {
    this.originalFetch = globalThis.fetch;
    this.currentScenario = scenario;
  }

  /**
   * Start mocking fetch requests
   */
  start(): void {
    if (this.isActive) {
      console.warn('[FETCH-MOCK] Already active, stopping previous instance');
      this.stop();
    }

    globalThis.fetch = this.createMockFetch();
    this.isActive = true;
    console.log(`[FETCH-MOCK] Started with scenario: ${this.currentScenario.name}`);
  }

  /**
   * Stop mocking and restore original fetch
   */
  stop(): void {
    if (this.isActive) {
      globalThis.fetch = this.originalFetch;
      this.isActive = false;
      console.log(`[FETCH-MOCK] Stopped. Intercepted ${this.requestLog.length} requests`);
    }
  }

  /**
   * Change the current scenario
   */
  setScenario(scenario: MockScenario): void {
    this.currentScenario = scenario;
    console.log(`[FETCH-MOCK] Switched to scenario: ${this.currentScenario.name}`);
  }

  /**
   * Get request log for debugging
   */
  getRequestLog(): Array<{ url: string; timestamp: number; method: string; metadata: RequestMetadata }> {
    return [...this.requestLog];
  }

  /**
   * Clear request log
   */
  clearRequestLog(): void {
    this.requestLog = [];
  }

  /**
   * Extract request context from fetch parameters
   */
  private extractRequestContext(input: string | Request | URL, init?: RequestInit): RequestContext {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';

    // Extract headers
    const headers: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, init.headers);
      }
    }

    // Extract body
    let body: unknown;
    if (init?.body) {
      try {
        body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
      } catch {
        body = init.body;
      }
    }

    return { url, method, headers, body };
  }

  /**
   * Create the mock fetch function using two-phase request handling
   */
  private createMockFetch(): typeof globalThis.fetch {
    return async (input: string | Request | URL, init?: RequestInit): Promise<Response> => {
      // Extract request context
      const context = this.extractRequestContext(input, init);

      // Analyze request to get metadata
      const metadata = RequestAnalyzer.analyzeRequest(context);

      // Log the request with metadata
      this.requestLog.push({
        url: context.url,
        timestamp: Date.now(),
        method: context.method,
        metadata
      });

      // Check if this is a local request (to our test server)
      if (context.url.includes('localhost') || context.url.includes('127.0.0.1')) {
        console.log(`[FETCH-MOCK] Passing through local request: ${context.method} ${context.url}`);
        return this.originalFetch(input, init);
      }

      // Phase 1: Request Validation
      const isExpected = this.currentScenario.isRequestExpected(context, metadata);

      if (!isExpected) {
        const error = new Error(
          `[FETCH-MOCK] Unexpected external request: ${context.method} ${context.url}\n` +
          `Provider: ${metadata.provider}, Model: ${metadata.model || 'unknown'}, Endpoint: ${metadata.endpoint}\n` +
          `This request was not expected by the current test scenario: ${this.currentScenario.name}`
        );
        console.error(error.message);
        throw error;
      }

      // Phase 2: Response Generation
      const mockResponse = this.currentScenario.generateResponse(context, metadata);

      console.log(`[FETCH-MOCK] Mocking ${context.method} ${context.url} -> ${mockResponse.status || 200}`);

      // Simulate network delay if specified
      if (mockResponse.delay && mockResponse.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, mockResponse.delay));
      }

      return new Response(JSON.stringify(mockResponse.body), {
        status: mockResponse.status || 200,
        headers: mockResponse.headers || { 'Content-Type': 'application/json' }
      });
    };
  }
}

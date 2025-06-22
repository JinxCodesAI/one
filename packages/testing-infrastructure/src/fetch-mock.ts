/**
 * Unified Fetch Mocking System for E2E Testing
 *
 * This module provides a sophisticated fetch mocking system that:
 * - Intercepts external API calls to AI providers
 * - Uses two-phase request handling (validation + response generation)
 * - Provides realistic mock responses based on request analysis
 * - Allows for different scenarios (success, error, timeout)
 * - Logs all intercepted requests for debugging
 * - Preserves local requests to the test server
 * - Supports both service-level and UI-level testing
 */

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body: unknown;
  delay?: number; // Simulate network delay in milliseconds
}

export interface RequestContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface RequestMetadata {
  // Provider identification
  provider: "openai" | "google" | "openrouter" | "anthropic" | "unknown";
  service: string; // Legacy compatibility

  // Request classification
  isInternalRequest: boolean;
  isExternalApi: boolean;
  isApiCall: boolean; // Legacy compatibility

  // Request details
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  model?: string; // Model extracted from URL or request body
}

export type RequestValidationHandler = (
  context: RequestContext,
  metadata: RequestMetadata,
) => boolean;
export type ResponseGenerationHandler = (
  context: RequestContext,
  metadata: RequestMetadata,
) => MockResponse;

export interface MockScenario {
  name: string;
  isRequestExpected: RequestValidationHandler;
  generateResponse: ResponseGenerationHandler;
}

export interface RequestLogEntry {
  context: RequestContext;
  metadata: RequestMetadata;
  timestamp: number;
}

/**
 * Utility functions for request analysis and metadata extraction
 */
export class RequestAnalyzer {
  private static readonly INTERNAL_PATTERNS = [
    "localhost",
    "127.0.0.1",
    ".local",
    ".internal",
    ".test",
  ];

  private static readonly EXTERNAL_SERVICES: Record<string, string> = {
    "api.openai.com": "openai",
    "generativelanguage.googleapis.com": "google",
    "openrouter.ai": "openrouter",
    "api.anthropic.com": "anthropic",
  };

  /**
   * Extract metadata from a request
   */
  static analyzeRequest(context: RequestContext): RequestMetadata {
    const url = new URL(context.url);
    const hostname = url.hostname;
    const pathname = url.pathname;

    // Detect internal vs external requests
    const isInternalRequest = this.INTERNAL_PATTERNS.some((pattern) =>
      hostname.includes(pattern)
    );

    // Determine provider based on hostname
    let provider: RequestMetadata["provider"] = "unknown";
    if (hostname.includes("api.openai.com")) {
      provider = "openai";
    } else if (hostname.includes("generativelanguage.googleapis.com")) {
      provider = "google";
    } else if (hostname.includes("openrouter.ai")) {
      provider = "openrouter";
    } else if (hostname.includes("api.anthropic.com")) {
      provider = "anthropic";
    }

    // Extract model information and determine endpoints
    let model: string | undefined;
    let endpoint = pathname;
    let isApiCall = false;

    if (provider === "openai" && pathname.includes("/chat/completions")) {
      isApiCall = true;
      endpoint = "/chat/completions";
      // Model is in the request body for OpenAI
      if (
        context.body && typeof context.body === "object" &&
        "model" in context.body
      ) {
        model = (context.body as any).model;
      }
    } else if (provider === "google" && pathname.includes(":generateContent")) {
      isApiCall = true;
      // Extract model from URL path like /v1beta/models/gemini-2.5-flash:generateContent
      const modelMatch = pathname.match(/\/models\/([^:]+):/);
      if (modelMatch) {
        model = modelMatch[1];
        endpoint = "/models/:model:generateContent";
      }
    } else if (
      provider === "openrouter" && pathname.includes("/chat/completions")
    ) {
      isApiCall = true;
      endpoint = "/chat/completions";
      // Model is in the request body for OpenRouter
      if (
        context.body && typeof context.body === "object" &&
        "model" in context.body
      ) {
        model = (context.body as any).model;
      }
    } else if (provider === "anthropic" && pathname.includes("/messages")) {
      isApiCall = true;
      endpoint = "/messages";
      // Model is in the request body for Anthropic
      if (
        context.body && typeof context.body === "object" &&
        "model" in context.body
      ) {
        model = (context.body as any).model;
      }
    }

    return {
      provider,
      service: provider, // Legacy compatibility
      isInternalRequest,
      isExternalApi: !isInternalRequest,
      isApiCall,
      endpoint,
      method: context.method,
      headers: context.headers,
      model,
    };
  }

  /**
   * Generate a realistic success response based on provider and request
   */
  static generateSuccessResponse(
    context: RequestContext,
    metadata: RequestMetadata,
  ): MockResponse {
    const baseResponse: MockResponse = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {},
      delay: 0,
    };

    switch (metadata.provider) {
      case "openai":
      case "openrouter":
        baseResponse.body = {
          id: `chatcmpl-test${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: metadata.model ||
            (metadata.provider === "openai"
              ? "gpt-4.1-nano"
              : "anthropic/claude-3.5-sonnet"),
          choices: [{
            index: 0,
            message: {
              role: "assistant",
              content: metadata.provider === "openai"
                ? "Hello! This is a mocked OpenAI response."
                : "Hello! This is a mocked OpenRouter/Anthropic response.",
            },
            finish_reason: "stop",
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 8,
            total_tokens: 18,
          },
        };
        break;

      case "google":
        baseResponse.body = {
          candidates: [{
            content: {
              parts: [{
                text: "Hello! This is a mocked Google Gemini response.",
              }],
              role: "model",
            },
            finishReason: "STOP",
            index: 0,
          }],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 8,
            totalTokenCount: 18,
          },
        };
        break;

      case "anthropic":
        baseResponse.body = {
          id: `msg_${this.generateId()}`,
          type: "message",
          role: "assistant",
          content: [{
            type: "text",
            text: "Hello! This is a mocked Anthropic Claude response.",
          }],
          model: metadata.model || "claude-3-sonnet-20240229",
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: {
            input_tokens: 10,
            output_tokens: 8,
          },
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
  static generateErrorResponse(
    context: RequestContext,
    metadata: RequestMetadata,
    errorType: "rate_limit" | "invalid_request" | "server_error" =
      "server_error",
  ): MockResponse {
    const baseResponse: MockResponse = {
      headers: { "Content-Type": "application/json" },
      body: {},
      delay: 0,
    };

    switch (metadata.provider) {
      case "openai":
      case "openrouter":
        if (errorType === "rate_limit") {
          baseResponse.status = 429;
          baseResponse.body = {
            error: {
              message: "Rate limit exceeded",
              type: "rate_limit_error",
              code: "rate_limit_exceeded",
            },
          };
        } else if (errorType === "invalid_request") {
          baseResponse.status = 400;
          baseResponse.body = {
            error: {
              message: "Invalid request",
              type: "invalid_request_error",
              code: "invalid_request",
            },
          };
        } else {
          baseResponse.status = 500;
          baseResponse.body = {
            error: {
              message: "Internal server error",
              type: "server_error",
              code: "server_error",
            },
          };
        }
        break;

      case "google":
        if (errorType === "rate_limit") {
          baseResponse.status = 429;
          baseResponse.body = {
            error: {
              code: 429,
              message: "Quota exceeded",
              status: "RESOURCE_EXHAUSTED",
            },
          };
        } else if (errorType === "invalid_request") {
          baseResponse.status = 400;
          baseResponse.body = {
            error: {
              code: 400,
              message: "Invalid request",
              status: "INVALID_ARGUMENT",
            },
          };
        } else {
          baseResponse.status = 500;
          baseResponse.body = {
            error: {
              code: 500,
              message: "Internal error",
              status: "INTERNAL",
            },
          };
        }
        break;

      case "anthropic":
        if (errorType === "rate_limit") {
          baseResponse.status = 429;
          baseResponse.body = {
            type: "error",
            error: {
              type: "rate_limit_error",
              message: "Rate limit exceeded",
            },
          };
        } else if (errorType === "invalid_request") {
          baseResponse.status = 400;
          baseResponse.body = {
            type: "error",
            error: {
              type: "invalid_request_error",
              message: "Invalid request",
            },
          };
        } else {
          baseResponse.status = 500;
          baseResponse.body = {
            type: "error",
            error: {
              type: "api_error",
              message: "Internal server error",
            },
          };
        }
        break;

      default:
        baseResponse.status = 500;
        baseResponse.body = { error: "Unknown provider error" };
    }

    return baseResponse;
  }

  /**
   * Generate a unique ID for mock responses
   */
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Fetch mock manager - the single source of truth for fetch mocking
 * Uses two-phase request handling: validation + response generation
 */
export class FetchMockManager {
  private originalFetch: typeof globalThis.fetch;
  private currentScenario: MockScenario;
  private requestLog: RequestLogEntry[] = [];
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
      console.warn("[FETCH-MOCK] Already active, stopping previous instance");
      this.stop();
    }

    globalThis.fetch = this.createMockFetch();
    this.isActive = true;
    console.log(
      `[FETCH-MOCK] Started with scenario: ${this.currentScenario.name}`,
    );
  }

  /**
   * Stop mocking and restore original fetch
   */
  stop(): void {
    if (this.isActive) {
      globalThis.fetch = this.originalFetch;
      this.isActive = false;
      console.log(
        `[FETCH-MOCK] Stopped. Intercepted ${this.requestLog.length} requests`,
      );
    }
  }

  /**
   * Change the current scenario
   */
  setScenario(scenario: MockScenario): void {
    this.currentScenario = scenario;
    console.log(
      `[FETCH-MOCK] Switched to scenario: ${this.currentScenario.name}`,
    );
  }

  /**
   * Get request log for debugging
   */
  getRequestLog(): RequestLogEntry[] {
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
  private async extractRequestContext(
    input: string | Request | URL,
    init?: RequestInit,
  ): Promise<RequestContext> {
    let url: string;
    let method: string;
    let headers: Record<string, string> = {};
    let body: unknown;

    if (typeof input === "string") {
      url = input;
      method = init?.method || "GET";
      if (init?.headers) {
        headers = this.headersToRecord(init.headers);
      }
      body = init?.body ? this.parseBody(init.body) : undefined;
    } else if (input instanceof URL) {
      url = input.toString();
      method = init?.method || "GET";
      if (init?.headers) {
        headers = this.headersToRecord(init.headers);
      }
      body = init?.body ? this.parseBody(init.body) : undefined;
    } else {
      // Request object
      url = input.url;
      method = input.method;
      headers = this.headersToRecord(input.headers);
      try {
        const bodyText = await input.clone().text();
        body = bodyText ? JSON.parse(bodyText) : undefined;
      } catch {
        body = undefined;
      }
    }

    return { url, method, headers, body };
  }

  /**
   * Convert HeadersInit to Record<string, string>
   */
  private headersToRecord(headers: HeadersInit): Record<string, string> {
    const record: Record<string, string> = {};

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        record[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        record[key] = value;
      });
    } else if (headers) {
      Object.assign(record, headers);
    }

    return record;
  }

  /**
   * Parse request body
   */
  private parseBody(body: BodyInit): unknown {
    try {
      if (typeof body === "string") {
        return JSON.parse(body);
      } else if (body instanceof FormData) {
        const obj: Record<string, unknown> = {};
        body.forEach((value, key) => {
          obj[key] = value;
        });
        return obj;
      } else if (body instanceof URLSearchParams) {
        const obj: Record<string, string> = {};
        body.forEach((value, key) => {
          obj[key] = value;
        });
        return obj;
      } else {
        return body;
      }
    } catch {
      return body;
    }
  }

  /**
   * Create the mock fetch function using two-phase request handling
   */
  private createMockFetch(): typeof globalThis.fetch {
    return async (
      input: string | Request | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      // Extract request context
      const context = await this.extractRequestContext(input, init);

      // Analyze request to get metadata
      const metadata = RequestAnalyzer.analyzeRequest(context);

      // Log the request with metadata
      this.requestLog.push({
        context,
        metadata,
        timestamp: Date.now(),
      });

      // Check if this is a local request (to our test server)
      if (metadata.isInternalRequest) {
        console.log(
          `[FETCH-MOCK] Passing through local request: ${context.method} ${context.url}`,
        );
        return this.originalFetch(input, init);
      }

      // Phase 1: Request Validation
      const isExpected = this.currentScenario.isRequestExpected(
        context,
        metadata,
      );

      if (!isExpected) {
        const error = new Error(
          `[FETCH-MOCK] Unexpected external request: ${context.method} ${context.url}\n` +
            `Provider: ${metadata.provider}, Model: ${
              metadata.model || "unknown"
            }, Endpoint: ${metadata.endpoint}\n` +
            `This request was not expected by the current test scenario: ${this.currentScenario.name}`,
        );
        console.error(error.message);
        throw error;
      }

      // Phase 2: Response Generation
      const mockResponse = this.currentScenario.generateResponse(
        context,
        metadata,
      );

      console.log(
        `[FETCH-MOCK] Mocking ${context.method} ${context.url} -> ${
          mockResponse.status || 200
        }`,
      );

      // Simulate network delay if specified
      if (mockResponse.delay && mockResponse.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, mockResponse.delay));
      }

      return new Response(JSON.stringify(mockResponse.body), {
        status: mockResponse.status || 200,
        headers: mockResponse.headers || { "Content-Type": "application/json" },
      });
    };
  }
}

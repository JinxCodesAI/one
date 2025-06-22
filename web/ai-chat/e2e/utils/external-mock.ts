/**
 * External Mock Manager for E2E testing
 * Based on the E2E Testing Guide architecture
 */

export interface RequestContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface RequestMetadata {
  isInternalRequest: boolean;
  isExternalApi: boolean;
  service: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  model?: string; // Model extracted from URL or request body
}

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body: any;
  delay?: number; // Network delay simulation in milliseconds
}

export interface MockScenario {
  name: string;
  isRequestExpected: (
    context: RequestContext,
    metadata: RequestMetadata,
  ) => boolean;
  generateResponse: (
    context: RequestContext,
    metadata: RequestMetadata,
  ) => MockResponse;
}

export interface RequestLogEntry {
  context: RequestContext;
  metadata: RequestMetadata;
  timestamp: number;
}

/**
 * Request analyzer for classifying internal vs external requests
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

  static analyzeRequest(context: RequestContext): RequestMetadata {
    const url = new URL(context.url);

    // Detect internal vs external requests
    const isInternalRequest = this.INTERNAL_PATTERNS.some((pattern) =>
      url.hostname.includes(pattern)
    );

    // Identify external service
    const service = this.identifyExternalService(url);

    // Extract model information based on service
    let model: string | undefined;

    if (service === "openai" && url.pathname.includes("/chat/completions")) {
      // For OpenAI, model is in the request body
      try {
        const requestBody = JSON.parse(context.body || "{}");
        model = requestBody.model;
      } catch {
        // Ignore JSON parse errors
      }
    } else if (
      service === "google" && url.pathname.includes(":generateContent")
    ) {
      // For Google, extract model from URL path like /v1beta/models/gemini-2.5-flash:generateContent
      const modelMatch = url.pathname.match(/\/models\/([^:]+):/);
      if (modelMatch) {
        model = modelMatch[1];
      }
    } else if (
      service === "openrouter" && url.pathname.includes("/chat/completions")
    ) {
      // For OpenRouter, model is in the request body
      try {
        const requestBody = JSON.parse(context.body || "{}");
        model = requestBody.model;
      } catch {
        // Ignore JSON parse errors
      }
    }

    return {
      isInternalRequest,
      isExternalApi: !isInternalRequest,
      service,
      endpoint: url.pathname,
      method: context.method,
      headers: context.headers,
      model,
    };
  }

  private static identifyExternalService(url: URL): string {
    return this.EXTERNAL_SERVICES[url.hostname] || "unknown";
  }

  /**
   * Generate a realistic success response for external services
   */
  static generateSuccessResponse(
    context: RequestContext,
    metadata: RequestMetadata,
  ): MockResponse {
    const baseResponse = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {},
    };

    // Generate service-specific response structure
    switch (metadata.service) {
      case "openai":
        return {
          ...baseResponse,
          body: {
            id: `chatcmpl-${this.generateId()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "gpt-4.1-nano",
            choices: [{
              index: 0,
              message: {
                role: "assistant",
                content: "Hello! How can I help you today?",
              },
              finish_reason: "stop",
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 8,
              total_tokens: 18,
            },
          },
        };

      case "google":
        return {
          ...baseResponse,
          body: {
            candidates: [{
              content: {
                parts: [{
                  text: "Hello! How can I help you today?",
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
          },
        };

      case "openrouter":
        return {
          ...baseResponse,
          body: {
            id: `gen-${this.generateId()}`,
            model: "anthropic/claude-3-sonnet",
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            choices: [{
              index: 0,
              message: {
                role: "assistant",
                content: "Hello! How can I help you today?",
              },
              finish_reason: "stop",
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 8,
              total_tokens: 18,
            },
          },
        };

      default:
        return baseResponse;
    }
  }

  /**
   * Generate error response for external services
   */
  static generateErrorResponse(
    context: RequestContext,
    metadata: RequestMetadata,
    errorType: string,
  ): MockResponse {
    switch (metadata.service) {
      case "openai":
        return {
          status: errorType === "rate_limit" ? 429 : 400,
          headers: { "Content-Type": "application/json" },
          body: {
            error: {
              message: errorType === "rate_limit"
                ? "Rate limit exceeded"
                : "Invalid request",
              type: errorType,
              code: errorType,
            },
          },
        };

      case "google":
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: {
            error: {
              code: 400,
              message: "Invalid request",
              status: "INVALID_ARGUMENT",
            },
          },
        };

      case "openrouter":
        return {
          status: errorType === "rate_limit" ? 429 : 400,
          headers: { "Content-Type": "application/json" },
          body: {
            error: {
              message: errorType === "rate_limit"
                ? "Rate limit exceeded"
                : "Invalid request",
              type: errorType,
              code: errorType,
            },
          },
        };

      default:
        return {
          status: 500,
          headers: { "Content-Type": "application/json" },
          body: { error: "Internal server error" },
        };
    }
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

/**
 * External Mock Manager for intercepting and mocking external API calls
 */
export class FetchMockManager {
  private originalFetch: typeof globalThis.fetch;
  private currentScenario: MockScenario;
  private requestLog: RequestLogEntry[] = [];

  constructor(scenario: MockScenario) {
    this.originalFetch = globalThis.fetch;
    this.currentScenario = scenario;
  }

  /**
   * Start intercepting fetch requests
   */
  start(): void {
    globalThis.fetch = this.createMockFetch();
  }

  /**
   * Stop intercepting and restore original fetch
   */
  stop(): void {
    globalThis.fetch = this.originalFetch;
  }

  /**
   * Switch to a different mock scenario
   */
  setScenario(scenario: MockScenario): void {
    this.currentScenario = scenario;
  }

  /**
   * Get the request log for verification
   */
  getRequestLog(): RequestLogEntry[] {
    return [...this.requestLog];
  }

  /**
   * Clear the request log
   */
  clearRequestLog(): void {
    this.requestLog = [];
  }

  private createMockFetch(): typeof globalThis.fetch {
    return async (
      input: string | Request | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const context = await this.extractRequestContext(input, init);
      const metadata = RequestAnalyzer.analyzeRequest(context);

      // Log all requests for debugging
      this.requestLog.push({ context, metadata, timestamp: Date.now() });

      // Phase 1: Request Validation
      const isExpected = this.currentScenario.isRequestExpected(
        context,
        metadata,
      );

      if (!isExpected) {
        // Pass through internal requests to real services
        if (metadata.isInternalRequest) {
          return this.originalFetch(input, init);
        }

        // Reject unexpected external requests
        throw new Error(
          `Unexpected external request: ${context.method} ${context.url}`,
        );
      }

      // Phase 2: Response Generation
      const mockResponse = this.currentScenario.generateResponse(
        context,
        metadata,
      );

      // Simulate network delay if specified
      if (mockResponse.delay) {
        await new Promise((resolve) => setTimeout(resolve, mockResponse.delay));
      }

      return new Response(JSON.stringify(mockResponse.body), {
        status: mockResponse.status || 200,
        headers: mockResponse.headers || { "Content-Type": "application/json" },
      });
    };
  }

  private async extractRequestContext(
    input: string | Request | URL,
    init?: RequestInit,
  ): Promise<RequestContext> {
    let url: string;
    let method: string;
    let headers: Record<string, string> = {};
    let body: string | undefined;

    if (typeof input === "string") {
      url = input;
      method = init?.method || "GET";
      if (init?.headers) {
        headers = this.headersToRecord(init.headers);
      }
      body = init?.body?.toString();
    } else if (input instanceof URL) {
      url = input.toString();
      method = init?.method || "GET";
      if (init?.headers) {
        headers = this.headersToRecord(init.headers);
      }
      body = init?.body?.toString();
    } else {
      // Request object
      url = input.url;
      method = input.method;
      headers = this.headersToRecord(input.headers);
      body = await input.text().catch(() => undefined);
    }

    return { url, method, headers, body };
  }

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
}

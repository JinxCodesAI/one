/**
 * AI API Service Client SDK
 *
 * ✅ **UNIVERSAL** - This SDK works in both browser and server environments.
 *
 * TypeScript/JavaScript SDK for interacting with the AI API service.
 * Provides text generation, object generation, and model management capabilities.
 *
 * **USAGE:**
 * - ✅ Frontend applications (React, Vue, vanilla JS)
 * - ✅ Server-side applications (Node.js, Deno, BFF servers)
 * - ✅ Service-to-service communication
 * - ✅ Edge functions and serverless environments
 *
 * **DEPENDENCIES:**
 * - Only uses standard `fetch()` API (available in modern browsers and runtimes)
 * - No browser-specific APIs (DOM, cookies, localStorage)
 * - No Node.js-specific APIs
 *
 * **EXAMPLES:**
 * ```typescript
 * // Browser usage
 * const client = createSimpleClient('https://ai-api.example.com');
 *
 * // Server usage
 * const client = createSimpleClient('http://localhost:8000');
 *
 * // Generate text
 * const response = await client.generateText({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   model: 'gpt-4.1-nano'
 * });
 * ```
 */

import type {
  ApiResponse,
  ClientConfig,
  GenerateObjectRequest,
  GenerateObjectResponse,
  GenerateTextRequest,
  GenerateTextResponse,
  HealthResponse,
} from "../types.ts";

/**
 * AI API client class
 */
export class AIClient {
  private config: ClientConfig;

  constructor(config: ClientConfig = {}) {
    this.config = {
      baseUrl: "http://localhost:8000",
      ...config,
    };
  }

  /**
   * Generate text using the AI service
   */
  async generateText(
    request: GenerateTextRequest,
  ): Promise<GenerateTextResponse> {
    const url = `${this.config.baseUrl}/generate`;

    try {
      const response = await this.makeRequest("POST", url, request);
      const apiResponse = await response.json() as ApiResponse<
        GenerateTextResponse
      >;

      if (!apiResponse.success) {
        throw new Error(apiResponse.error?.error || "Unknown error occurred");
      }

      if (!apiResponse.data) {
        throw new Error("No data received from server");
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Text generation failed: ${error}`);
    }
  }

  /**
   * Generate structured object using the AI service
   */
  async generateObject<T extends Record<string, unknown>>(
    request: GenerateObjectRequest,
  ): Promise<GenerateObjectResponse<T>> {
    const url = `${this.config.baseUrl}/generate-object`;

    try {
      const response = await this.makeRequest("POST", url, request);
      const apiResponse = await response.json() as ApiResponse<
        GenerateObjectResponse<T>
      >;

      if (!apiResponse.success) {
        throw new Error(apiResponse.error?.error || "Unknown error occurred");
      }

      if (!apiResponse.data) {
        throw new Error("No data received from server");
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Object generation failed: ${error}`);
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    const url = `${this.config.baseUrl}/models`;

    try {
      const response = await this.makeRequest("GET", url);
      const apiResponse = await response.json() as ApiResponse<
        { models: string[] }
      >;

      if (!apiResponse.success) {
        throw new Error(apiResponse.error?.error || "Failed to get models");
      }

      return apiResponse.data?.models || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to get models: ${error}`);
    }
  }

  /**
   * Check service health
   */
  async getHealth(): Promise<HealthResponse> {
    const url = `${this.config.baseUrl}/health`;

    try {
      const response = await this.makeRequest("GET", url);
      const apiResponse = await response.json() as ApiResponse<HealthResponse>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.error?.error || "Health check failed");
      }

      if (!apiResponse.data) {
        throw new Error("No health data received from server");
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Health check failed: ${error}`);
    }
  }

  /**
   * Make an HTTP request with proper error handling
   */
  private async makeRequest(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout || 30000);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText) as ApiResponse<never>;
          if (errorData.error?.error) {
            errorMessage = errorData.error.error;
          }
        } catch {
          // If we can't parse the error response, use the status text
        }

        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(`Network error: Unable to connect to ${url}`);
      }

      throw error;
    }
  }
}

/**
 * Create a new AI client instance
 */
export function createClient(config: ClientConfig): AIClient {
  return new AIClient(config);
}

/**
 * Convenience function to create a client with just a base URL
 */
export function createSimpleClient(
  baseUrl?: string,
  timeout?: number,
): AIClient {
  return new AIClient({ baseUrl, timeout });
}

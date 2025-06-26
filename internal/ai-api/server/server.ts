/**
 * HTTP server implementation using Deno's built-in server
 */

import { AIService } from "../core/ai-service.ts";
import type {
  ApiResponse,
  ErrorResponse,
  GenerateObjectRequest,
  GenerateObjectResponse,
  GenerateTextRequest,
  HealthResponse,
  ServiceConfig,
} from "../types.ts";

/**
 * HTTP server class
 */
export class AIServer {
  private aiService: AIService;
  private config: ServiceConfig;
  private server?: Deno.HttpServer;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.aiService = new AIService(config);
  }

  /**
   * Start the HTTP server
   */
  start(): Promise<void> {
    const handler = this.createHandler();

    this.server = Deno.serve({
      port: this.config.port,
      hostname: this.config.host,
    }, handler);

    console.log(
      `AI API server running on http://${this.config.host}:${this.config.port}`,
    );

    return Promise.resolve();
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    if (this.server) {
      await this.server.shutdown();
      console.log("AI API server stopped");
    }
  }

  /**
   * Create the main request handler
   */
  private createHandler(): (request: Request) => Promise<Response> {
    return async (request: Request): Promise<Response> => {
      try {
        const url = new URL(request.url);
        const method = request.method;

        // Add CORS headers
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };

        // Handle preflight requests
        if (method === "OPTIONS") {
          return new Response(null, { status: 200, headers: corsHeaders });
        }

        // Route requests
        if (url.pathname === "/health" && method === "GET") {
          return await this.handleHealth(corsHeaders);
        }

        if (url.pathname === "/generate" && method === "POST") {
          return await this.handleGenerateText(request, corsHeaders);
        }

        if (url.pathname === "/models" && method === "GET") {
          return this.handleGetModels(corsHeaders);
        }

        if (url.pathname === "/generate-object" && method === "POST") {
          return await this.handleGenerateObject(request, corsHeaders);
        }

        // 404 for unknown routes
        return this.createErrorResponse(
          { error: "Not Found", code: "NOT_FOUND" },
          404,
          corsHeaders,
        );
      } catch (error) {
        console.error("Unhandled server error:", error);
        return this.createErrorResponse(
          { error: "Internal Server Error", code: "INTERNAL_ERROR" },
          500,
          { "Access-Control-Allow-Origin": "*" },
        );
      }
    };
  }

  /**
   * Handle health check requests
   */
  private async handleHealth(
    corsHeaders: Record<string, string>,
  ): Promise<Response> {
    try {
      const health = await this.aiService.getHealth();
      const response: HealthResponse = {
        status: health.status as "healthy" | "unhealthy",
        timestamp: new Date().toISOString(),
        models: health.models,
        version: "0.0.1",
      };

      return this.createSuccessResponse(response, corsHeaders);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      return this.createErrorResponse(
        { error: "Health check failed", details: { message: errorMessage } },
        500,
        corsHeaders,
      );
    }
  }

  /**
   * Handle text generation requests
   */
  private async handleGenerateText(
    request: Request,
    corsHeaders: Record<string, string>,
  ): Promise<Response> {
    try {
      // Parse request body
      const body = await request.json();
      const generateRequest = body as GenerateTextRequest;

      // Validate request
      this.aiService.validateRequest(generateRequest);

      // Generate text
      const result = await this.aiService.generateText(generateRequest);

      return this.createSuccessResponse(result, corsHeaders);
    } catch (error) {
      console.error("Text generation error:", error);

      // Determine appropriate status code
      let status = 500;
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      if (
        errorMessage.includes("Invalid") || errorMessage.includes("required")
      ) {
        status = 400;
      }

      return this.createErrorResponse(
        { error: errorMessage, code: "GENERATION_ERROR" },
        status,
        corsHeaders,
      );
    }
  }

  /**
   * Handle object generation requests
   */
  private async handleGenerateObject(
    request: Request,
    corsHeaders: Record<string, string>,
  ): Promise<Response> {
    try {
      // Parse request body
      const body = await request.json();
      const generateRequest = body as GenerateObjectRequest;

      // Validate request
      this.aiService.validateGenerateObjectRequest(generateRequest);

      // Generate object
      const result = await this.aiService.generateObject(generateRequest);

      return this.createSuccessResponse(result, corsHeaders);
    } catch (error) {
      console.error("Object generation error:", error);

      // Determine appropriate status code
      let status = 500;
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      if (
        errorMessage.includes("Invalid") || errorMessage.includes("required")
      ) {
        status = 400;
      }

      return this.createErrorResponse(
        { error: errorMessage, code: "GENERATION_ERROR" },
        status,
        corsHeaders,
      );
    }
  }

  /**
   * Handle get models requests
   */
  private handleGetModels(corsHeaders: Record<string, string>): Response {
    try {
      const models = this.aiService.getAvailableModels();
      return this.createSuccessResponse({ models }, corsHeaders);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      return this.createErrorResponse(
        { error: "Failed to get models", details: { message: errorMessage } },
        500,
        corsHeaders,
      );
    }
  }

  /**
   * Create a success response
   */
  private createSuccessResponse<T>(
    data: T,
    headers: Record<string, string> = {},
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  }

  /**
   * Create an error response
   */
  private createErrorResponse(
    error: ErrorResponse,
    status: number,
    headers: Record<string, string> = {},
  ): Response {
    const response: ApiResponse<never> = {
      success: false,
      error,
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  }
}

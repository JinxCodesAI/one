/**
 * Core AI service that abstracts provider-specific implementations
 */

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import type {
  GenerateTextRequest,
  GenerateTextResponse,
  Message,
  ModelMapping,
  ProviderConfig,
  ServiceConfig,
} from "../types.ts";

// Type for AI provider clients - using any for compatibility with different provider signatures
type ProviderClient = any;

/**
 * Core AI service class
 */
export class AIService {
  private config: ServiceConfig;
  private providerClients: Map<string, ProviderClient> = new Map();

  constructor(config: ServiceConfig) {
    this.config = config;
    this.initializeProviders();
  }

  /**
   * Initialize AI provider clients
   */
  private initializeProviders(): void {
    for (const provider of this.config.providers) {
      try {
        const client = this.createProviderClient(provider);
        this.providerClients.set(provider.name, client);
        console.log(`Initialized provider: ${provider.name}`);
      } catch (error) {
        console.error(`Failed to initialize provider ${provider.name}:`, error);
      }
    }
  }

  /**
   * Create a provider client based on configuration
   */
  private createProviderClient(config: ProviderConfig): ProviderClient {
    switch (config.name.toLowerCase()) {
      case "openai":
        return openai;
      case "google":
        return google;
      case "openrouter":
        return createOpenRouter({
          apiKey: config.apiKey,
        });
      default:
        throw new Error(`Unsupported provider: ${config.name}`);
    }
  }

  /**
   * Get model mapping by friendly name
   */
  private getModelMapping(modelName?: string): ModelMapping {
    const targetModel = modelName || this.config.defaultModel;

    const mapping = this.config.models.find((m) => m.name === targetModel);
    if (!mapping) {
      throw new Error(`Model not found: ${targetModel}`);
    }

    return mapping;
  }

  /**
   * Get provider client for a model
   */
  private getProviderClient(providerName: string): ProviderClient {
    const client = this.providerClients.get(providerName);
    if (!client) {
      throw new Error(`Provider client not found: ${providerName}`);
    }
    return client;
  }

  /**
   * Convert our Message format to AI library format
   */
  private convertMessages(messages: Message[]): any[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Generate text using the specified model
   */
  async generateText(
    request: GenerateTextRequest,
  ): Promise<GenerateTextResponse> {
    try {
      // Get model mapping
      const modelMapping = this.getModelMapping(request.model);

      // Get provider client
      const providerClient = this.getProviderClient(modelMapping.provider);

      // Convert messages to AI library format
      const messages = this.convertMessages(request.messages);

      // Get provider configuration
      const providerConfig = this.config.providers.find((p) =>
        p.name === modelMapping.provider
      );
      if (!providerConfig) {
        throw new Error(
          `Provider configuration not found: ${modelMapping.provider}`,
        );
      }

      // Create model with provider-specific configuration
      let model;
      switch (modelMapping.provider.toLowerCase()) {
        case "openai":
          model = providerClient(modelMapping.modelId, {
            apiKey: providerConfig.apiKey,
            baseURL: providerConfig.baseUrl,
          });
          break;
        case "google":
          model = providerClient(modelMapping.modelId, {
            apiKey: providerConfig.apiKey,
          });
          break;
        case "openrouter":
          model = providerClient(modelMapping.modelId);
          break;
        default:
          throw new Error(`Unsupported provider: ${modelMapping.provider}`);
      }

      // Generate text using the AI library
      const result = await generateText({
        model,
        messages,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
      });

      // Return formatted response
      return {
        content: result.text,
        model: modelMapping.name,
        usage: result.usage
          ? {
            promptTokens: result.usage.promptTokens,
            completionTokens: result.usage.completionTokens,
            totalTokens: result.usage.totalTokens,
          }
          : undefined,
      };
    } catch (error) {
      console.error("Error generating text:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Text generation failed: ${errorMessage}`);
    }
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return this.config.models.map((m) => m.name);
  }

  /**
   * Get service health status
   */
  getHealth(): { status: string; models: string[] } {
    const models = this.getAvailableModels();
    const activeProviders = Array.from(this.providerClients.keys());

    return {
      status: activeProviders.length > 0 ? "healthy" : "unhealthy",
      models,
    };
  }

  /**
   * Validate a generate text request
   */
  validateRequest(request: GenerateTextRequest): void {
    if (!request.messages || !Array.isArray(request.messages)) {
      throw new Error("Messages array is required");
    }

    if (request.messages.length === 0) {
      throw new Error("At least one message is required");
    }

    for (const message of request.messages) {
      if (
        !message.role || !["user", "assistant", "system"].includes(message.role)
      ) {
        throw new Error("Invalid message role");
      }
      if (!message.content || typeof message.content !== "string") {
        throw new Error("Message content is required and must be a string");
      }
    }

    if (
      request.model && !this.config.models.find((m) => m.name === request.model)
    ) {
      throw new Error(`Invalid model: ${request.model}`);
    }

    if (
      request.maxTokens && (request.maxTokens < 1 || request.maxTokens > 4096)
    ) {
      throw new Error("maxTokens must be between 1 and 4096");
    }

    if (
      request.temperature &&
      (request.temperature < 0 || request.temperature > 1)
    ) {
      throw new Error("temperature must be between 0 and 1");
    }
  }
}

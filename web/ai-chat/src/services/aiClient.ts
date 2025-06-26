/**
 * AI Client service for the chat application
 * Uses the ai-api SDK for communication with the AI service
 */

import { createSimpleClient } from "../../../../internal/ai-api/sdk/client.ts";
import type { Message } from "../types.ts";

/**
 * AI Client wrapper class for chat functionality
 */
export class ChatAIClient {
  private client: ReturnType<typeof createSimpleClient>;

  constructor(baseUrl: string = "http://localhost:8000") {
    this.client = createSimpleClient(baseUrl);
  }

  /**
   * Generate text response from AI
   */
  async generateText(
    messages: Message[],
    model?: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
    },
  ) {
    try {
      // Convert app messages to API format
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.generateText({
        messages: apiMessages,
        model,
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
      });

      return response;
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  }

  /**
   * Get available models from the AI service
   */
  async getModels(): Promise<string[]> {
    try {
      return await this.client.getModels();
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  }

  /**
   * Check service health
   */
  async getHealth() {
    try {
      return await this.client.getHealth();
    } catch (error) {
      console.error("Error checking health:", error);
      throw error;
    }
  }
}

/**
 * Get AI API URL from environment or use default
 */
function getAIApiUrl(): string {
  // In browser environment, check for Vite environment variables
  if (typeof window !== "undefined") {
    // @ts-ignore - Vite injects these at build time
    return import.meta.env?.VITE_AI_API_URL || "http://localhost:8000";
  }

  // In Node/Deno environment, check process environment
  return Deno?.env?.get("AI_API_URL") || "http://localhost:8000";
}

/**
 * Default AI client instance
 */
export const aiClient = new ChatAIClient(getAIApiUrl());

/**
 * Create a new AI client with custom configuration
 */
export function createAIClient(baseUrl?: string): ChatAIClient {
  return new ChatAIClient(baseUrl);
}

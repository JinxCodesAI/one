/**
 * AI Client service for the chat application
 * Uses the BFF API endpoints for communication with the AI service
 */

import type { Message } from "../types.ts";

/**
 * AI response types
 */
export interface AIGenerateResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIHealthResponse {
  status: string;
  models: string[];
  version?: string;
}

/**
 * AI Client wrapper class for chat functionality
 */
export class ChatAIClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api/ai") {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a request to the BFF AI endpoints
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      const errorMessage = data.error || 'Request failed';
      throw new Error(errorMessage);
    }

    return data.data;
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
  ): Promise<AIGenerateResponse> {
    try {
      // Convert app messages to API format
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.request<AIGenerateResponse>('/generate', {
        method: 'POST',
        body: JSON.stringify({
          messages: apiMessages,
          model,
          maxTokens: options?.maxTokens,
          temperature: options?.temperature,
        }),
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
      const response = await this.request<{ models: string[] }>('/models');
      return response?.models || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  }

  /**
   * Check service health
   */
  async getHealth(): Promise<AIHealthResponse> {
    try {
      return await this.request<AIHealthResponse>('/health');
    } catch (error) {
      console.error("Error checking health:", error);
      throw error;
    }
  }
}

/**
 * Default AI client instance
 */
export const aiClient = new ChatAIClient();

/**
 * Create a new AI client with custom configuration
 */
export function createAIClient(baseUrl?: string): ChatAIClient {
  return new ChatAIClient(baseUrl);
}

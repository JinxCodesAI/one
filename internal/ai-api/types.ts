/**
 * Core type definitions for the AI API service
 * These types are shared across all components (server, SDK, core service)
 */

/**
 * Represents a message in a conversation
 */
export interface Message {
  /** The role of the message sender */
  role: 'user' | 'assistant' | 'system';
  /** The content of the message */
  content: string;
}

/**
 * Request payload for text generation
 */
export interface GenerateTextRequest {
  /** Array of messages representing the conversation */
  messages: Message[];
  /** Optional model name to use for generation */
  model?: string;
  /** Optional maximum number of tokens to generate */
  maxTokens?: number;
  /** Optional temperature for randomness (0-1) */
  temperature?: number;
}

/**
 * Response from text generation
 */
export interface GenerateTextResponse {
  /** The generated text content */
  content: string;
  /** The model used for generation */
  model: string;
  /** Usage statistics */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  /** Error message */
  error: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Configuration for AI providers
 */
export interface ProviderConfig {
  /** Provider name (e.g., 'openai', 'anthropic') */
  name: string;
  /** API key for the provider */
  apiKey: string;
  /** Base URL for the provider API */
  baseUrl?: string;
  /** Default model for this provider */
  defaultModel?: string;
}

/**
 * Model mapping configuration
 */
export interface ModelMapping {
  /** Friendly model name used by clients */
  name: string;
  /** Provider that hosts this model */
  provider: string;
  /** Provider-specific model identifier */
  modelId: string;
  /** Whether this is the default model */
  isDefault?: boolean;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  /** Port for the HTTP server */
  port: number;
  /** Host for the HTTP server */
  host: string;
  /** Available AI providers */
  providers: ProviderConfig[];
  /** Model mappings */
  models: ModelMapping[];
  /** Default model to use when none specified */
  defaultModel: string;
}

/**
 * SDK client configuration
 */
export interface ClientConfig {
  /** Base URL of the AI API service */
  baseUrl?: string;
  /** Optional timeout for requests in milliseconds */
  timeout?: number;
}

/**
 * Health check response
 */
export interface HealthResponse {
  /** Service status */
  status: 'healthy' | 'unhealthy';
  /** Timestamp of the check */
  timestamp: string;
  /** Available models */
  models: string[];
  /** Service version */
  version: string;
}

/**
 * HTTP response wrapper
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (present on success) */
  data?: T;
  /** Error information (present on failure) */
  error?: ErrorResponse;
}

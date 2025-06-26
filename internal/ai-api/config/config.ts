/**
 * Configuration management for the AI API service
 */

import type { ModelMapping, ProviderConfig, ServiceConfig } from "../types.ts";

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  port: 8000,
  host: "0.0.0.0",
  defaultModel: "gpt-4.1-nano",
};

/**
 * Default model mappings
 */
const DEFAULT_MODELS: ModelMapping[] = [
  // OpenAI models
  {
    name: "gpt-4.1-nano",
    provider: "openai",
    modelId: "gpt-4.1-nano",
    isDefault: true,
  },
  {
    name: "gpt-4.1-mini",
    provider: "openai",
    modelId: "gpt-4.1-mini",
  },
  {
    name: "gpt-4.1",
    provider: "openai",
    modelId: "gpt-4.1",
  },
  {
    name: "gpt-4o",
    provider: "openai",
    modelId: "gpt-4o",
  },
  // Google models
  {
    name: "gemini-2.5-flash-lite",
    provider: "google",
    modelId: "gemini-2.5-flash-lite-preview-06-17",
  },
  {
    name: "gemini-2.5-flash",
    provider: "google",
    modelId: "gemini-2.5-flash",
  },
  {
    name: "gemini-2.5-pro",
    provider: "google",
    modelId: "gemini-2.5-pro",
  },
  // Anthropic models via OpenRouter
  {
    name: "anthropic/claude-3.5-sonnet",
    provider: "openrouter",
    modelId: "anthropic/claude-3.5-sonnet",
  },
  {
    name: "anthropic/claude-3.5-haiku",
    provider: "openrouter",
    modelId: "anthropic/claude-3.5-haiku",
  },
];

/**
 * Load configuration from environment variables
 */
export function loadConfig(): ServiceConfig {
  const providers: ProviderConfig[] = [];

  // Load OpenAI configuration
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (openaiApiKey) {
    providers.push({
      name: "openai",
      apiKey: openaiApiKey,
      baseUrl: Deno.env.get("OPENAI_BASE_URL") || "https://api.openai.com/v1",
      defaultModel: Deno.env.get("OPENAI_DEFAULT_MODEL") || "gpt-4.1-nano",
    });
  }

  // Load Google Generative AI configuration
  const googleApiKey = Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY");
  if (googleApiKey) {
    providers.push({
      name: "google",
      apiKey: googleApiKey,
      baseUrl: Deno.env.get("GOOGLE_BASE_URL") ||
        "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: Deno.env.get("GOOGLE_DEFAULT_MODEL") || "gemini-2.5-flash",
    });
  }

  // Load OpenRouter configuration (for Anthropic and other models)
  const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (openrouterApiKey) {
    providers.push({
      name: "openrouter",
      apiKey: openrouterApiKey,
      baseUrl: Deno.env.get("OPENROUTER_BASE_URL") ||
        "https://openrouter.ai/api/v1",
      defaultModel: Deno.env.get("OPENROUTER_DEFAULT_MODEL") ||
        "anthropic/claude-3.5-sonnet",
    });
  }

  // Validate that at least one provider is configured
  if (providers.length === 0) {
    throw new Error(
      "No AI providers configured. Please set at least one of: OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, OPENROUTER_API_KEY",
    );
  }

  // Load custom models from environment if provided
  let models = DEFAULT_MODELS;
  const customModelsJson = Deno.env.get("AI_MODELS");
  if (customModelsJson) {
    try {
      const customModels = JSON.parse(customModelsJson) as ModelMapping[];
      models = customModels;
    } catch (error) {
      console.warn("Failed to parse AI_MODELS environment variable:", error);
      console.warn("Using default model mappings");
    }
  }

  // Filter models to only include those with available providers
  const availableProviders = new Set(providers.map((p) => p.name));
  const availableModels = models.filter((m) =>
    availableProviders.has(m.provider)
  );

  if (availableModels.length === 0) {
    throw new Error("No models available for configured providers");
  }

  // Determine default model
  let defaultModel = Deno.env.get("AI_DEFAULT_MODEL") ||
    DEFAULT_CONFIG.defaultModel;

  // Ensure the default model is available
  if (!availableModels.find((m) => m.name === defaultModel)) {
    // Use the first available model as default
    defaultModel = availableModels[0].name;
    console.warn(
      `Default model '${
        Deno.env.get("AI_DEFAULT_MODEL") || DEFAULT_CONFIG.defaultModel
      }' not available. Using '${defaultModel}' instead.`,
    );
  }

  return {
    port: parseInt(Deno.env.get("PORT") || DEFAULT_CONFIG.port.toString(), 10),
    host: Deno.env.get("HOST") || DEFAULT_CONFIG.host,
    providers,
    models: availableModels,
    defaultModel,
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: ServiceConfig): void {
  if (!config.providers || config.providers.length === 0) {
    throw new Error("At least one provider must be configured");
  }

  if (!config.models || config.models.length === 0) {
    throw new Error("At least one model must be configured");
  }

  if (!config.defaultModel) {
    throw new Error("Default model must be specified");
  }

  if (!config.models.find((m) => m.name === config.defaultModel)) {
    throw new Error(
      `Default model '${config.defaultModel}' not found in available models`,
    );
  }

  for (const provider of config.providers) {
    if (!provider.name || !provider.apiKey) {
      throw new Error(
        `Provider ${provider.name || "unknown"} missing required configuration`,
      );
    }
  }

  for (const model of config.models) {
    if (!model.name || !model.provider || !model.modelId) {
      throw new Error(
        `Model ${model.name || "unknown"} missing required configuration`,
      );
    }

    if (!config.providers.find((p) => p.name === model.provider)) {
      throw new Error(
        `Model '${model.name}' references unknown provider '${model.provider}'`,
      );
    }
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error("Port must be between 1 and 65535");
  }
}

/**
 * Get configuration with validation
 */
export function getConfig(): ServiceConfig {
  const config = loadConfig();
  validateConfig(config);
  return config;
}

/**
 * Print configuration summary (without sensitive data)
 */
export function printConfigSummary(config: ServiceConfig): void {
  console.log("AI API Service Configuration:");
  console.log(`  Server: ${config.host}:${config.port}`);
  console.log(`  Default Model: ${config.defaultModel}`);
  console.log(`  Providers: ${config.providers.map((p) => p.name).join(", ")}`);
  console.log(
    `  Available Models: ${config.models.map((m) => m.name).join(", ")}`,
  );
}

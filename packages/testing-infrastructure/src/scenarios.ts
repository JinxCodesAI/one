/**
 * Common Test Scenarios and Helpers
 *
 * Pre-built mock scenarios and helper functions for common testing patterns.
 * These scenarios can be used across different projects to ensure consistent
 * testing behavior and reduce duplication.
 */

// deno-lint-ignore-file no-explicit-any

import type { MockScenario, RequestContext, RequestMetadata } from "./fetch-mock.ts";
import { RequestAnalyzer } from "./fetch-mock.ts";

/**
 * Provider-specific response content for scenarios
 */
export interface ProviderResponses {
  openai?: string;
  google?: string;
  openrouter?: string;
  anthropic?: string;
}

/**
 * Default response content for each provider
 */
export const DEFAULT_PROVIDER_RESPONSES: Required<ProviderResponses> = {
  openai: "Hello! This is a mocked OpenAI response.",
  google: "Hello! This is a mocked Google Gemini response.",
  openrouter: "Hello! This is a mocked OpenRouter/Anthropic response.",
  anthropic: "Hello! This is a mocked Anthropic Claude response."
};

/**
 * Create a successful AI response scenario for specific providers
 */
export function createSuccessScenario(
  providers: Array<'openai' | 'google' | 'openrouter' | 'anthropic'> = ['openai', 'google', 'openrouter', 'anthropic'],
  responses: ProviderResponses = {}
): MockScenario {
  const finalResponses = { ...DEFAULT_PROVIDER_RESPONSES, ...responses };

  return {
    name: `Success scenario for ${providers.join(', ')}`,
    isRequestExpected: (_context: RequestContext, metadata: RequestMetadata) => {
      return metadata.isExternalApi &&
             metadata.provider !== 'unknown' &&
             providers.includes(metadata.provider as 'openai' | 'google' | 'openrouter' | 'anthropic');
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
      const body = response.body as any;

      // Customize response content based on provider
      switch (metadata.provider) {
        case 'openai':
          if (body.choices?.[0]?.message) {
            body.choices[0].message.content = finalResponses.openai;
          }
          break;
        case 'google':
          if (body.candidates?.[0]?.content?.parts?.[0]) {
            body.candidates[0].content.parts[0].text = finalResponses.google;
          }
          break;
        case 'openrouter':
          if (body.choices?.[0]?.message) {
            body.choices[0].message.content = finalResponses.openrouter;
          }
          break;
        case 'anthropic':
          if (body.content?.[0]) {
            body.content[0].text = finalResponses.anthropic;
          }
          break;
      }

      return response;
    }
  };
}

/**
 * Create a scenario for specific provider only
 */
export function createSingleProviderSuccessScenario(
  provider: 'openai' | 'google' | 'openrouter' | 'anthropic',
  responseContent?: string
): MockScenario {
  const responses: ProviderResponses = {};
  if (responseContent) {
    responses[provider] = responseContent;
  }
  
  return createSuccessScenario([provider], responses);
}

/**
 * Create an error scenario for AI services
 */
export function createErrorScenario(
  errorType: 'rate_limit' | 'invalid_request' | 'server_error' = 'server_error',
  providers: Array<'openai' | 'google' | 'openrouter' | 'anthropic'> = ['openai', 'google', 'openrouter', 'anthropic']
): MockScenario {
  return {
    name: `Error scenario (${errorType}) for ${providers.join(', ')}`,
    isRequestExpected: (_context: RequestContext, metadata: RequestMetadata) => {
      return metadata.isExternalApi &&
             metadata.provider !== 'unknown' &&
             providers.includes(metadata.provider as 'openai' | 'google' | 'openrouter' | 'anthropic');
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      return RequestAnalyzer.generateErrorResponse(context, metadata, errorType);
    }
  };
}

/**
 * Create a scenario with network delays
 */
export function createSlowResponseScenario(
  delay: number = 2000,
  providers: Array<'openai' | 'google' | 'openrouter' | 'anthropic'> = ['openai', 'google', 'openrouter', 'anthropic'],
  responses: ProviderResponses = {}
): MockScenario {
  const finalResponses = { ...DEFAULT_PROVIDER_RESPONSES, ...responses };

  return {
    name: `Slow response scenario (${delay}ms) for ${providers.join(', ')}`,
    isRequestExpected: (_context: RequestContext, metadata: RequestMetadata) => {
      return metadata.isExternalApi &&
             metadata.provider !== 'unknown' &&
             providers.includes(metadata.provider as 'openai' | 'google' | 'openrouter' | 'anthropic');
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
      response.delay = delay;
      
      const body = response.body as any;
      
      // Customize response content based on provider
      switch (metadata.provider) {
        case 'openai':
          if (body.choices?.[0]?.message) {
            body.choices[0].message.content = finalResponses.openai;
          }
          break;
        case 'google':
          if (body.candidates?.[0]?.content?.parts?.[0]) {
            body.candidates[0].content.parts[0].text = finalResponses.google;
          }
          break;
        case 'openrouter':
          if (body.choices?.[0]?.message) {
            body.choices[0].message.content = finalResponses.openrouter;
          }
          break;
        case 'anthropic':
          if (body.content?.[0]) {
            body.content[0].text = finalResponses.anthropic;
          }
          break;
      }
      
      return response;
    }
  };
}

/**
 * Create a scenario that rejects all external requests (for testing internal-only functionality)
 */
export function createNoExternalRequestsScenario(): MockScenario {
  return {
    name: "No external requests allowed",
    isRequestExpected: (_context: RequestContext, metadata: RequestMetadata) => {
      return !metadata.isExternalApi; // Only allow internal requests
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      return RequestAnalyzer.generateSuccessResponse(context, metadata);
    }
  };
}

/**
 * Create a UI-specific success scenario with model-specific responses
 */
export function createUISuccessScenario(
  openaiResponse: string = "Hello! This is GPT-4.1-nano responding.",
  googleResponse: string = "Hello! This is Gemini-2.5-flash responding.",
  anthropicResponse: string = "Hello! This is Claude-3.5-sonnet responding."
): MockScenario {
  return {
    name: "UI Success Scenario",
    isRequestExpected: (_context: RequestContext, metadata: RequestMetadata) => {
      return metadata.isExternalApi &&
             metadata.provider !== 'unknown' &&
             ['openai', 'google', 'openrouter'].includes(metadata.provider);
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
      const body = response.body as any;
      
      const model = metadata.model;
      
      if (metadata.provider === 'openai' && model === 'gpt-4.1-nano') {
        body.choices[0].message.content = openaiResponse;
      } else if (metadata.provider === 'google' && model === 'gemini-2.5-flash') {
        body.candidates[0].content.parts[0].text = googleResponse;
      } else if (metadata.provider === 'openrouter' && model === 'anthropic/claude-3.5-sonnet') {
        body.choices[0].message.content = anthropicResponse;
      }
      
      return response;
    }
  };
}

/**
 * Create a mixed scenario that handles different providers with different behaviors
 */
export function createMixedScenario(config: {
  openai?: 'success' | 'error' | 'slow';
  google?: 'success' | 'error' | 'slow';
  openrouter?: 'success' | 'error' | 'slow';
  anthropic?: 'success' | 'error' | 'slow';
  responses?: ProviderResponses;
  delay?: number;
  errorType?: 'rate_limit' | 'invalid_request' | 'server_error';
}): MockScenario {
  const { responses = {}, delay = 2000, errorType = 'server_error' } = config;
  const finalResponses = { ...DEFAULT_PROVIDER_RESPONSES, ...responses };
  
  return {
    name: "Mixed behavior scenario",
    isRequestExpected: (_context: RequestContext, metadata: RequestMetadata) => {
      return metadata.isExternalApi &&
        metadata.provider !== 'unknown' &&
        ['openai', 'google', 'openrouter', 'anthropic'].includes(metadata.provider) &&
        config[metadata.provider as keyof typeof config] !== undefined;
    },
    generateResponse: (context: RequestContext, metadata: RequestMetadata) => {
      if (metadata.provider === 'unknown') {
        return RequestAnalyzer.generateSuccessResponse(context, metadata);
      }
      const behavior = config[metadata.provider as keyof typeof config];
      
      switch (behavior) {
        case 'error':
          return RequestAnalyzer.generateErrorResponse(context, metadata, errorType);
          
        case 'slow': {
          const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
          response.delay = delay;
          
          // Customize response content
          const body = response.body as any;
          switch (metadata.provider) {
            case 'openai':
              if (body.choices?.[0]?.message) {
                body.choices[0].message.content = finalResponses.openai;
              }
              break;
            case 'google':
              if (body.candidates?.[0]?.content?.parts?.[0]) {
                body.candidates[0].content.parts[0].text = finalResponses.google;
              }
              break;
            case 'openrouter':
              if (body.choices?.[0]?.message) {
                body.choices[0].message.content = finalResponses.openrouter;
              }
              break;
            case 'anthropic':
              if (body.content?.[0]) {
                body.content[0].text = finalResponses.anthropic;
              }
              break;
          }
          
          return response;
        }
          
        case 'success':
        default: {
          const response = RequestAnalyzer.generateSuccessResponse(context, metadata);
          
          // Customize response content
          const body = response.body as any;
          switch (metadata.provider) {
            case 'openai':
              if (body.choices?.[0]?.message) {
                body.choices[0].message.content = finalResponses.openai;
              }
              break;
            case 'google':
              if (body.candidates?.[0]?.content?.parts?.[0]) {
                body.candidates[0].content.parts[0].text = finalResponses.google;
              }
              break;
            case 'openrouter':
              if (body.choices?.[0]?.message) {
                body.choices[0].message.content = finalResponses.openrouter;
              }
              break;
            case 'anthropic':
              if (body.content?.[0]) {
                body.content[0].text = finalResponses.anthropic;
              }
              break;
          }
          
          return response;
        }
      }
    }
  };
}

/**
 * Shared utilities for E2E tests
 */

import { startServer } from "../../main.ts";
import { createSimpleClient } from "../../sdk/client.ts";
import type { AIServer } from "../../server/server.ts";

/**
 * Test environment configuration
 */
export interface E2ETestConfig {
  port: number;
  timeout?: number;
}

/**
 * Default test configuration
 */
export const DEFAULT_E2E_CONFIG: E2ETestConfig = {
  port: 8001,
  timeout: 5000
};

/**
 * Setup test environment with required environment variables
 */
export function setupTestEnvironment(config: E2ETestConfig = DEFAULT_E2E_CONFIG): void {
  // Set required environment variables for testing
  Deno.env.set('NODE_ENV', 'test');
  Deno.env.set('OPENAI_API_KEY', 'test-openai-key');
  Deno.env.set('GOOGLE_GENERATIVE_AI_API_KEY', 'test-google-key');
  Deno.env.set('OPENROUTER_API_KEY', 'test-openrouter-key');
  Deno.env.set('PORT', config.port.toString());
}

/**
 * Helper to start server and create client
 */
export async function setupServerAndClient(config: E2ETestConfig = DEFAULT_E2E_CONFIG): Promise<{
  server: AIServer;
  client: ReturnType<typeof createSimpleClient>;
  cleanup: () => Promise<void>;
}> {
  const server = await startServer();
  
  // Give server time to start
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const client = createSimpleClient(`http://localhost:${config.port}`, config.timeout);
  
  const cleanup = async () => {
    await server.stop();
  };
  
  return { server, client, cleanup };
}

/**
 * Generate unique port for test isolation
 */
export function generateTestPort(): number {
  // Use a base port and add random offset to avoid conflicts
  return 8000 + Math.floor(Math.random() * 1000);
}

/**
 * Create test configuration with unique port
 */
export function createTestConfig(overrides: Partial<E2ETestConfig> = {}): E2ETestConfig {
  return {
    ...DEFAULT_E2E_CONFIG,
    port: generateTestPort(),
    ...overrides
  };
}

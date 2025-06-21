/**
 * AI API Service - Main entry point
 *
 * This file serves as both:
 * 1. The main server entry point when run directly
 * 2. The module export for SDK functionality
 */

import { load } from "@std/dotenv";
import { AIServer } from './server/server.ts';
import { getConfig, printConfigSummary } from './config/config.ts';

// Export SDK functionality
export { AIClient, createClient, createSimpleClient } from './sdk/client.ts';
export { AIService } from './core/ai-service.ts';
export * from './types.ts';

/**
 * Start the AI API server
 */
export async function startServer(): Promise<AIServer> {
  try {
    console.log('Starting AI API Service...');

    // Load environment variables from .env file
    await load({ export: true });

    // Load and validate configuration
    const config = getConfig();
    printConfigSummary(config);

    // Create and start server
    const server = new AIServer(config);
    await server.start();

    return server;
  } catch (error) {
    console.error('Failed to start AI API service:', error);

    // In test environment, throw error instead of exiting
    if (Deno.env.get('NODE_ENV') === 'test') {
      throw error;
    }

    Deno.exit(1);
  }
}

/**
 * Main entry point when run directly
 */
if (import.meta.main) {
  // Handle graceful shutdown
  const server = await startServer();

  // Handle shutdown signals
  const handleShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    await server.stop();
    Deno.exit(0);
  };

  // Listen for shutdown signals (Windows only supports SIGINT)
  Deno.addSignalListener('SIGINT', () => handleShutdown('SIGINT'));

  // Only add SIGTERM listener on non-Windows platforms
  if (Deno.build.os !== 'windows') {
    Deno.addSignalListener('SIGTERM', () => handleShutdown('SIGTERM'));
  }
}

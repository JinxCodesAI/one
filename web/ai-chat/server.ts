/**
 * Production Server Entry Point for AI Chat
 * 
 * This file is used for production deployment and imports the main BFF server.
 * It ensures the server runs in production mode with proper static file serving.
 */

// Set production environment
Deno.env.set("NODE_ENV", "production");

// Import and start the BFF server
import app from './server/index.ts';

// The server will start automatically when server/index.ts is imported
// because of the `if (import.meta.main)` check in that file.
// This file just ensures we're in production mode.

export default app;

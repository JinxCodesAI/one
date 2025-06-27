/**
 * Main BFF Server Entry Point
 * 
 * This is the organized server implementation using the modular structure.
 * It imports route handlers and middleware from separate files.
 */

import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import route handlers
import { aiRoutes } from './api/ai.ts';
import { profileRoutes } from './api/profile.ts';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';
import { validateJSON, rateLimit, requestSizeLimit } from './middleware/validation.ts';

// Import utilities
import { checkServiceHealth } from './utils/serviceClient.ts';

// Configuration
const INTERNAL_AI_API_URL = Deno.env.get("INTERNAL_AI_API_URL") || "http://localhost:8000";
const INTERNAL_PROFILE_API_URL = Deno.env.get("INTERNAL_PROFILE_API_URL") || "http://localhost:8080";
const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);
const NODE_ENV = Deno.env.get("NODE_ENV") || "development";

// Create Hono app
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', errorHandler);

// CORS configuration
app.use('/api/*', cors({
  origin: NODE_ENV === "production" 
    ? ["https://*.jinxcodes.ai"] 
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request validation and security middleware for API routes
app.use('/api/*', validateJSON);
app.use('/api/*', rateLimit(100, 60000)); // 100 requests per minute
app.use('/api/*', requestSizeLimit(1024 * 1024)); // 1MB limit

// Health check endpoint
app.get('/health', async (c) => {
  const [aiHealth, profileHealth] = await Promise.allSettled([
    checkServiceHealth(INTERNAL_AI_API_URL),
    checkServiceHealth(INTERNAL_PROFILE_API_URL)
  ]);

  const aiStatus = aiHealth.status === 'fulfilled' ? aiHealth.value : { status: 'unhealthy', error: 'Failed to check' };
  const profileStatus = profileHealth.status === 'fulfilled' ? profileHealth.value : { status: 'unhealthy', error: 'Failed to check' };

  const overallStatus = aiStatus.status === 'healthy' && profileStatus.status === 'healthy' ? 'healthy' : 'degraded';

  return c.json({ 
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      ai: {
        url: INTERNAL_AI_API_URL,
        ...aiStatus
      },
      profile: {
        url: INTERNAL_PROFILE_API_URL,
        ...profileStatus
      }
    },
    environment: NODE_ENV
  });
});

// API routes
const api = app.basePath('/api');

// Mount route handlers
api.route('/ai', aiRoutes);
api.route('/profile', profileRoutes);

// Static file serving for production
if (NODE_ENV === "production") {
  // Serve static assets
  app.use('/assets/*', serveStatic({ root: './dist' }));
  
  // Serve index.html for all other routes (SPA routing)
  app.use('*', serveStatic({ 
    root: './dist',
    rewriteRequestPath: (path) => {
      // Don't rewrite API routes or asset routes
      if (path.startsWith('/api/') || path.startsWith('/assets/')) {
        return path;
      }
      // Serve index.html for all other routes
      return '/index.html';
    }
  }));
} else {
  // Development mode - let Vite handle static files
  app.get('/', (c) => {
    return c.text('Todo App BFF Server - Development Mode\nFrontend should be served by Vite dev server on port 5173');
  });
}

// 404 handler (must be last)
app.notFound(notFoundHandler);

// Export for Deno.serve
export default {
  port: PORT,
  fetch: app.fetch,
};

// Start server if this file is run directly
if (import.meta.main) {
  console.log(`🚀 Todo App BFF Server starting on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🤖 AI API: ${INTERNAL_AI_API_URL}`);
  console.log(`👤 Profile API: ${INTERNAL_PROFILE_API_URL}`);
  
  Deno.serve({ port: PORT }, app.fetch);
}

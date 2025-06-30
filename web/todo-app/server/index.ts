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
import { load } from "@std/dotenv";
import { checkServiceHealth } from './utils/serviceClient.ts';

// Load environment variables from .env file
try {
  await load({ export: true });
} catch {
  // .env file doesn't exist, that's fine
}

// Configuration
const AI_API_PORT = parseInt(Deno.env.get("AI_API_PORT") || "8000", 10);
const PROFILE_SERVICE_PORT = parseInt(Deno.env.get("PROFILE_SERVICE_PORT") || "8081", 10);
const AI_API_HOST = Deno.env.get("AI_API_HOST") || "localhost";
const PROFILE_SERVICE_HOST = Deno.env.get("PROFILE_SERVICE_HOST") || "localhost";

// Construct service URLs from ports and hosts
const INTERNAL_AI_API_URL = `http://${AI_API_HOST}:${AI_API_PORT}`;
const INTERNAL_PROFILE_API_URL = `http://${PROFILE_SERVICE_HOST}:${PROFILE_SERVICE_PORT}`;

const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);
const NODE_ENV = Deno.env.get("NODE_ENV") || "development";
const LOG_LEVEL = Deno.env.get("LOG_LEVEL") || "info";
const ENABLE_REQUEST_LOGGING = Deno.env.get("ENABLE_REQUEST_LOGGING") === "true";
const ENABLE_ERROR_DETAILS = Deno.env.get("ENABLE_ERROR_DETAILS") === "true";

// Create Hono app
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', errorHandler);

// Custom detailed logging for debugging
app.use('*', async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;
  const userAgent = c.req.header('User-Agent') || 'unknown';

  // Only log if request logging is enabled
  if (ENABLE_REQUEST_LOGGING) {
    console.log(`🔍 [${new Date().toISOString()}] ${method} ${path}`);
    if (LOG_LEVEL === 'debug') {
      console.log(`   User-Agent: ${userAgent.substring(0, 80)}...`);
      console.log(`   Headers: ${JSON.stringify(Object.fromEntries(c.req.raw.headers.entries()))}`);
    }
  }

  try {
    await next();
    const ms = Date.now() - start;
    const status = c.res.status;
    const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';

    if (ENABLE_REQUEST_LOGGING) {
      console.log(`${statusEmoji} [${new Date().toISOString()}] ${method} ${path} - ${status} (${ms}ms)`);
    }

    // Always log errors regardless of logging settings
    if (status >= 400) {
      console.error(`🚨 ERROR RESPONSE: ${method} ${path} - ${status} (${ms}ms)`);
      if (ENABLE_ERROR_DETAILS) {
        try {
          const responseText = await c.res.clone().text();
          console.error(`   Response body: ${responseText}`);
        } catch {
          console.error(`   Could not read response body`);
        }
      }
    }
  } catch (error) {
    const ms = Date.now() - start;
    console.error(`💥 [${new Date().toISOString()}] ${method} ${path} - EXCEPTION (${ms}ms):`);
    console.error(`   Error name: ${error instanceof Error ? error.name : 'Unknown'}`);
    console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);

    if (ENABLE_ERROR_DETAILS && error instanceof Error) {
      console.error(`   Stack trace: ${error.stack}`);
    }

    throw error;
  }
});

// CORS configuration
app.use('/api/*', cors({
  origin: NODE_ENV === "production"
    ? ["https://*.jinxcodes.ai"]
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Anon-Id'],
}));

// Request validation and security middleware for API routes
app.use('/api/*', validateJSON);
app.use('/api/*', rateLimit(100, 60000)); // 100 requests per minute
app.use('/api/*', requestSizeLimit(1024 * 1024)); // 1MB limit

// Health check endpoint
app.get('/health', async (c) => {
  try {
    console.log(`🏥 [${new Date().toISOString()}] Health check starting...`);
    console.log(`   Checking AI service: ${INTERNAL_AI_API_URL}`);
    console.log(`   Checking Profile service: ${INTERNAL_PROFILE_API_URL}`);

    const [aiHealth, profileHealth] = await Promise.allSettled([
      checkServiceHealth(INTERNAL_AI_API_URL),
      checkServiceHealth(INTERNAL_PROFILE_API_URL)
    ]);

    const aiStatus = aiHealth.status === 'fulfilled' ? aiHealth.value : {
      status: 'unhealthy',
      error: aiHealth.status === 'rejected' ? aiHealth.reason?.message || 'Failed to check' : 'Failed to check'
    };

    const profileStatus = profileHealth.status === 'fulfilled' ? profileHealth.value : {
      status: 'unhealthy',
      error: profileHealth.status === 'rejected' ? profileHealth.reason?.message || 'Failed to check' : 'Failed to check'
    };

    const overallStatus = aiStatus.status === 'healthy' && profileStatus.status === 'healthy' ? 'healthy' : 'degraded';

    console.log(`🏥 [${new Date().toISOString()}] Health check completed - Status: ${overallStatus}`);
    console.log(`   AI: ${aiStatus.status} ${aiStatus.error ? `(${aiStatus.error})` : ''}`);
    console.log(`   Profile: ${profileStatus.status} ${profileStatus.error ? `(${profileStatus.error})` : ''}`);

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
  } catch (error) {
    console.error(`🏥 [${new Date().toISOString()}] Health check failed:`, error);
    if (error instanceof Error) {
      console.error(`   Error details: ${error.message}`);
      if (ENABLE_ERROR_DETAILS) {
        console.error(`   Stack: ${error.stack}`);
      }
    }

    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: NODE_ENV
    }, 500);
  }
});

// API routes
const api = app.basePath('/api');

api.get('/test', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy'
    }
  });
});

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

// Start server if this file is run directly
if (import.meta.main) {
  console.log(`🚀 Todo App BFF Server starting...`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🌐 Port: ${PORT}`);

  // Log environment variable configuration
  console.log(`📋 Environment Variables:`);
  console.log(`   AI_API_PORT: ${Deno.env.get("AI_API_PORT") || "not set"}`);
  console.log(`   AI_API_HOST: ${Deno.env.get("AI_API_HOST") || "not set"}`);
  console.log(`   PROFILE_SERVICE_PORT: ${Deno.env.get("PROFILE_SERVICE_PORT") || "not set"}`);
  console.log(`   PROFILE_SERVICE_HOST: ${Deno.env.get("PROFILE_SERVICE_HOST") || "not set"}`);
  console.log(`   LOG_LEVEL: ${Deno.env.get("LOG_LEVEL") || "not set"}`);
  console.log(`   ENABLE_REQUEST_LOGGING: ${Deno.env.get("ENABLE_REQUEST_LOGGING") || "not set"}`);
  console.log(`   ENABLE_ERROR_DETAILS: ${Deno.env.get("ENABLE_ERROR_DETAILS") || "not set"}`);

  // Log constructed URLs
  console.log(`🔗 Service URLs:`);
  console.log(`   🤖 AI API: ${INTERNAL_AI_API_URL}`);
  console.log(`   👤 Profile API: ${INTERNAL_PROFILE_API_URL}`);
  console.log(`📁 Static files: ${NODE_ENV === "production" ? "./dist" : "disabled (development)"}`);

  try {
    console.log(`🔄 Starting Deno.serve on port ${PORT}...`);

    Deno.serve({
      port: PORT,
      onListen: ({ port, hostname }) => {
        console.log(`✅ BFF Server successfully started!`);
        console.log(`🌐 Listening on http://${hostname}:${port}`);
        console.log(`📋 Available endpoints:`);
        console.log(`   - GET  /health`);
        console.log(`   - GET  /api/test`);
        console.log(`   - GET  /api/ai/health`);
        console.log(`   - GET  /api/ai/models`);
        console.log(`   - GET  /api/profile/user-info`);
        console.log(`   - GET  /api/profile/credits`);
        if (NODE_ENV === "production") {
          console.log(`   - GET  /* (static files from ./dist)`);
        }
        console.log(`🔗 Test with: curl http://localhost:${port}/health`);
      }
    }, app.fetch);
  } catch (error) {
    console.error(`❌ Failed to start BFF server:`, error);
    if (error instanceof Error) {
      console.error(`📋 Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    Deno.exit(1);
  }
}

// Export for Deno.serve
export default app;

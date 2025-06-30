/**
 * Error handling middleware for the BFF server
 */

import type { Context, Next } from 'hono';

export interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      path: c.req.path,
      method: c.req.method
    };

    // Don't expose internal error details in production
    if (Deno.env.get("NODE_ENV") === "production") {
      delete errorResponse.details;
    }

    return c.json(errorResponse, 500);
  }
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (c: Context) => {
  const errorResponse: ErrorResponse = {
    error: 'Not found',
    details: `Route ${c.req.method} ${c.req.path} not found`,
    timestamp: new Date().toISOString(),
    path: c.req.path,
    method: c.req.method
  };

  return c.json(errorResponse, 404);
};

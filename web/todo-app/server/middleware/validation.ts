/**
 * Request validation middleware for the BFF server
 */

import type { Context, Next } from 'hono';

/**
 * Validate JSON request body
 */
export const validateJSON = async (c: Context, next: Next) => {
  if (c.req.method === 'POST' || c.req.method === 'PUT' || c.req.method === 'PATCH') {
    const contentType = c.req.header('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      return c.json({
        error: 'Content-Type must be application/json'
      }, 400);
    }

    try {
      // Check if there's actually content to parse
      const contentLength = parseInt(c.req.header('content-length') || '0', 10);

      if (contentLength > 0) {
        // Try to parse JSON to validate it - Hono handles body parsing automatically
        const body = await c.req.json();
        // Store the parsed body for reuse if needed
        c.set('parsedBody', body);
      } else {
        // Empty body is valid for some endpoints (like claim-daily-bonus)
        c.set('parsedBody', {});
      }
    } catch (error) {
      return c.json({
        error: 'Invalid JSON in request body',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 400);
    }
  }

  await next();
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return async (c: Context, next: Next) => {
    const clientIP = c.req.header('x-forwarded-for') || 
                     c.req.header('x-real-ip') || 
                     'unknown';
    
    const now = Date.now();
    const clientData = requestCounts.get(clientIP);
    
    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      requestCounts.set(clientIP, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      // Increment counter
      clientData.count++;
      
      if (clientData.count > maxRequests) {
        return c.json({
          error: 'Rate limit exceeded',
          details: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`
        }, 429);
      }
    }
    
    await next();
  };
};

/**
 * Request size limit middleware
 */
export const requestSizeLimit = (maxSizeBytes: number = 1024 * 1024) => {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      return c.json({
        error: 'Request too large',
        details: `Maximum request size is ${maxSizeBytes} bytes`
      }, 413);
    }
    
    await next();
  };
};

/**
 * Server Middleware
 * 
 * Common middleware functions for the profile service HTTP server.
 */

import type { ProfileServiceConfig } from "../types.ts";

export interface RequestContext {
  anonId?: string;
  headers: Headers;
  url: URL;
  method: string;
}

/**
 * CORS middleware to handle cross-origin requests
 */
export function corsMiddleware(config: ProfileServiceConfig) {
  return (request: Request): Response | null => {
    const origin = request.headers.get("origin");
    console.log("Origin:", origin);
    const method = request.method;

    // Handle preflight requests
    if (method === "OPTIONS") {
      const headers = new Headers();
      
      if (origin && isOriginAllowed(origin, config.corsOrigins)) {
        headers.set("Access-Control-Allow-Origin", origin);
      }
      
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, X-Anon-Id");
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set("Access-Control-Max-Age", "86400");

      return new Response(null, { status: 204, headers });
    }

    return null; // Continue to next middleware
  };
}

/**
 * Authentication middleware to extract anon ID from cookie or header
 */
export function authMiddleware(request: Request): RequestContext {
  const headers = request.headers;
  const url = new URL(request.url);
  const method = request.method;

  // Try to get anon ID from X-Anon-Id header first
  let anonId = headers.get("X-Anon-Id");

  // Fallback to cookie if header not present
  if (!anonId) {
    const cookieHeader = headers.get("cookie");
    if (cookieHeader) {
      const cookies = parseCookies(cookieHeader);
      anonId = cookies.anon_id;
    }
  }

  return {
    anonId: anonId || undefined,
    headers,
    url,
    method
  };
}

/**
 * Response middleware to add CORS headers to responses
 */
export function addCorsHeaders(
  response: Response, 
  request: Request, 
  config: ProfileServiceConfig
): Response {
  const origin = request.headers.get("origin");
  
  if (origin && isOriginAllowed(origin, config.corsOrigins)) {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return response;
}

/**
 * Validation middleware for request body
 */
export async function validateJsonBody<T>(
  request: Request,
  validator: (data: unknown) => data is T
): Promise<T> {
  if (!request.body) {
    throw new Error("Request body is required");
  }

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error("Content-Type must be application/json");
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!validator(data)) {
    throw new Error("Invalid request body format");
  }

  return data;
}

/**
 * Rate limiting middleware (simple in-memory implementation)
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  reset(): void {
    this.requests.clear();
  }
}

// Helper functions

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some(allowed => {
    if (allowed === "*") return true;
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(";").forEach(cookie => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = rest.join("=");
    }
  });
  
  return cookies;
}

/**
 * Error handling middleware
 */
export function createErrorResponse(error: Error, status = 500): Response {
  console.error("Request error:", error);
  
  const body = {
    error: error.message,
    status
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

/**
 * Utility functions for internal service communication
 */

/**
 * Configuration for internal services
 */
export interface ServiceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Generic service client for making authenticated requests to internal services
 */
export class ServiceClient {
  private config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = {
      timeout: 10000, // 10 seconds default
      ...config
    };
  }

  /**
   * Make an authenticated request to an internal service
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add API key if configured
    if (this.config.apiKey) {
      requestHeaders['X-Internal-API-Key'] = this.config.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, headers);
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, body, headers);
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, body, headers);
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, headers);
  }
}

/**
 * Health check utility for internal services
 */
export async function checkServiceHealth(serviceUrl: string): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${serviceUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        status: 'healthy',
        responseTime
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Retry utility for service calls
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

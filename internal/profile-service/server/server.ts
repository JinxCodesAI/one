/**
 * HTTP Server
 * 
 * Main HTTP server implementation for the profile service.
 */

import { serveDir } from "@std/http/file-server";
import type { DatabaseAdapter, ProfileServiceConfig } from "../types.ts";
import { corsMiddleware, addCorsHeaders } from "./middleware.ts";
import { ProfileServiceRoutes } from "./routes.ts";

export class ProfileServiceServer {
  private db: DatabaseAdapter;
  private config: ProfileServiceConfig;
  private routes: ProfileServiceRoutes;
  private abortController?: AbortController;

  constructor(db: DatabaseAdapter, config: ProfileServiceConfig) {
    this.db = db;
    this.config = config;
    this.routes = new ProfileServiceRoutes(db, config);
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    this.abortController = new AbortController();
    
    console.log(`🚀 Starting Profile Service on port ${this.config.port}`);
    console.log(`📋 CORS origins: ${this.config.corsOrigins.join(", ")}`);
    console.log(`🍪 Cookie domain: ${this.config.cookieDomain}`);

    try {
      await Deno.serve({
        port: this.config.port,
        signal: this.abortController.signal,
        onListen: ({ port, hostname }) => {
          console.log(`✅ Profile Service listening on http://${hostname}:${port}`);
        }
      }, this.handleRequest.bind(this));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("🛑 Profile Service stopped");
      } else {
        console.error("❌ Server error:", error);
        throw error;
      }
    }
  }

  /**
   * Stop the HTTP server
   */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Main request handler
   */
  private async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    const corsResponse = corsMiddleware(this.config)(request);
    if (corsResponse) {
      return corsResponse;
    }

    try {
      let response: Response;

      // Route API requests
      if (pathname.startsWith("/api/")) {
        response = await this.handleApiRequest(request, pathname, method);
      }
      // Serve static files
      else if (pathname === "/storage.html") {
        response = await this.handleStorageHtml(request);
      }
      // Health check at root
      else if (pathname === "/" || pathname === "/health") {
        response = await this.routes.handleHealthCheck();
      }
      // 404 for everything else
      else {
        response = new Response("Not Found", { status: 404 });
      }

      // Add CORS headers to response
      return addCorsHeaders(response, request, this.config);

    } catch (error) {
      console.error("Request handling error:", error);
      const errorResponse = new Response(
        JSON.stringify({ error: "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
      return addCorsHeaders(errorResponse, request, this.config);
    }
  }

  /**
   * Handle API requests
   */
  private async handleApiRequest(
    request: Request, 
    pathname: string, 
    method: string
  ): Promise<Response> {
    // Remove /api prefix
    const apiPath = pathname.slice(4);

    switch (`${method} ${apiPath}`) {
      case "GET /userinfo":
        return this.routes.handleUserInfo(request);
      
      case "GET /profile":
        return this.routes.handleGetProfile(request);
      
      case "POST /profile":
        return this.routes.handleUpdateProfile(request);
      
      case "GET /credits":
        return this.routes.handleGetCredits(request);
      
      case "POST /credits/daily-award":
        return this.routes.handleDailyAward(request);
      
      case "POST /credits/adjust":
        return this.routes.handleCreditAdjust(request);
      
      case "GET /healthz":
        return this.routes.handleHealthCheck();
      
      default:
        return new Response(
          JSON.stringify({ error: "API endpoint not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" }
          }
        );
    }
  }

  /**
   * Serve the storage.html file for iframe localStorage protocol
   */
  private async handleStorageHtml(request: Request): Promise<Response> {
    try {
      // Try to serve from static directory
      const staticResponse = await serveDir(request, {
        fsRoot: "./static",
        urlRoot: "",
      });

      if (staticResponse.status === 200) {
        return staticResponse;
      }

      // Fallback: serve inline HTML if file doesn't exist
      const html = this.getStorageHtml();
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "public, max-age=3600"
        }
      });
    } catch (error) {
      console.error("Error serving storage.html:", error);
      const html = this.getStorageHtml();
      return new Response(html, {
        headers: {
          "Content-Type": "text/html"
        }
      });
    }
  }

  /**
   * Generate storage.html content inline
   */
  private getStorageHtml(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Profile Service Storage</title>
</head>
<body>
    <script>
        // Iframe storage protocol for cross-domain localStorage access
        window.addEventListener('message', function(event) {
            // Validate origin
            const allowedOrigins = ${JSON.stringify(this.config.corsOrigins)};
            const isAllowed = allowedOrigins.includes('*') || 
                            allowedOrigins.some(origin => {
                                if (origin.startsWith('*.')) {
                                    const domain = origin.slice(2);
                                    return event.origin.endsWith(domain);
                                }
                                return event.origin === origin;
                            });
            
            if (!isAllowed) {
                console.warn('Storage iframe: Origin not allowed:', event.origin);
                return;
            }

            const { type, key, value, requestId } = event.data;
            
            try {
                let result;
                
                switch (type) {
                    case 'get':
                        result = localStorage.getItem(key);
                        break;
                    case 'set':
                    case 'backup':
                        localStorage.setItem(key, value);
                        result = value;
                        break;
                    default:
                        throw new Error('Unknown storage operation: ' + type);
                }
                
                event.source.postMessage({
                    requestId,
                    success: true,
                    value: result
                }, event.origin);
                
            } catch (error) {
                event.source.postMessage({
                    requestId,
                    success: false,
                    error: error.message
                }, event.origin);
            }
        });
        
        // Signal that the iframe is ready
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'storage-ready' }, '*');
        }
    </script>
</body>
</html>`;
  }
}

/**
 * Create and configure the profile service server
 */
export function createServer(
  db: DatabaseAdapter, 
  config: ProfileServiceConfig
): ProfileServiceServer {
  return new ProfileServiceServer(db, config);
}

/**
 * Start the profile service server (for use in main.ts)
 */
export async function startServer(
  db: DatabaseAdapter, 
  config: ProfileServiceConfig
): Promise<ProfileServiceServer> {
  const server = createServer(db, config);
  
  // Start server in background
  server.start().catch(error => {
    console.error("Failed to start server:", error);
    Deno.exit(1);
  });
  
  return server;
}

/**
 * Server Test Setup Utilities
 *
 * Provides standardized utilities for setting up server-based E2E tests:
 * - Environment configuration
 * - Server startup and client creation
 * - Test isolation with unique ports
 * - Cleanup management
 *
 * This module is designed to be generic and avoid circular dependencies
 * by accepting server startup functions and client factories as parameters.
 */

/**
 * Generic test configuration interface
 */
export interface ServerTestConfig {
  port: number;
  timeout?: number;
  baseUrl?: string;
}

/**
 * Default test configuration
 */
export const DEFAULT_SERVER_TEST_CONFIG: ServerTestConfig = {
  port: 8001,
  timeout: 5000,
};

/**
 * Generic server interface - any server that can be started and stopped
 */
export interface TestServer {
  stop(): Promise<void>;
}

/**
 * Generic client interface - any client that can make requests
 */
export interface TestClient {
  // Intentionally generic - specific client methods will be available via type casting
  [key: string]: unknown;
}

/**
 * Server test environment
 */
export interface ServerTestEnvironment<
  TServer extends TestServer = TestServer,
  TClient extends TestClient = TestClient,
> {
  server: TServer;
  client: TClient;
  config: ServerTestConfig;
  cleanup: () => Promise<void>;
}

/**
 * Server startup function type
 */
export type ServerStartupFunction<TServer extends TestServer = TestServer> =
  () => Promise<TServer>;

/**
 * Client factory function type
 */
export type ClientFactory<TClient extends TestClient = TestClient> = (
  baseUrl: string,
  timeout?: number,
) => TClient;

/**
 * Setup test environment with required environment variables
 */
export function setupServerTestEnvironment(
  config: ServerTestConfig = DEFAULT_SERVER_TEST_CONFIG,
): void {
  // Set required environment variables for testing
  Deno.env.set("NODE_ENV", "test");
  Deno.env.set("PORT", config.port.toString());

  // Set common AI provider API keys for testing
  Deno.env.set("OPENAI_API_KEY", "test-openai-key");
  Deno.env.set("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");
  Deno.env.set("OPENROUTER_API_KEY", "test-openrouter-key");
  Deno.env.set("ANTHROPIC_API_KEY", "test-anthropic-key");
}

/**
 * Helper to start server and create client
 */
export async function createServerTestEnvironment<
  TServer extends TestServer = TestServer,
  TClient extends TestClient = TestClient,
>(
  startServer: ServerStartupFunction<TServer>,
  createClient: ClientFactory<TClient>,
  config: ServerTestConfig = DEFAULT_SERVER_TEST_CONFIG,
): Promise<ServerTestEnvironment<TServer, TClient>> {
  // Setup environment
  setupServerTestEnvironment(config);

  // Start server
  const server = await startServer();

  // Give server time to start
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Create client
  const baseUrl = config.baseUrl || `http://localhost:${config.port}`;
  const client = createClient(baseUrl, config.timeout);

  const cleanup = async () => {
    await server.stop();
  };

  return { server, client, config, cleanup };
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
export function createServerTestConfig(
  overrides: Partial<ServerTestConfig> = {},
): ServerTestConfig {
  return {
    ...DEFAULT_SERVER_TEST_CONFIG,
    port: generateTestPort(),
    ...overrides,
  };
}

/**
 * Wait for server to be ready by making health check requests
 */
export async function waitForServer(
  baseUrl: string,
  healthEndpoint: string = "/health",
  timeout: number = 10000,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`${baseUrl}${healthEndpoint}`);
      if (response.ok) {
        console.log(`Server ready at ${baseUrl}`);
        return;
      }
    } catch {
      // Server not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Server failed to start within ${timeout}ms`);
}

/**
 * Enhanced server test environment with health check
 */
export async function createServerTestEnvironmentWithHealthCheck<
  TServer extends TestServer = TestServer,
  TClient extends TestClient = TestClient,
>(
  startServer: ServerStartupFunction<TServer>,
  createClient: ClientFactory<TClient>,
  config: ServerTestConfig = DEFAULT_SERVER_TEST_CONFIG,
  healthEndpoint: string = "/health",
): Promise<ServerTestEnvironment<TServer, TClient>> {
  // Setup environment
  setupServerTestEnvironment(config);

  // Start server
  const server = await startServer();

  // Wait for server to be ready
  const baseUrl = config.baseUrl || `http://localhost:${config.port}`;
  await waitForServer(baseUrl, healthEndpoint, config.timeout || 10000);

  // Create client
  const client = createClient(baseUrl, config.timeout);

  const cleanup = async () => {
    await server.stop();
  };

  return { server, client, config, cleanup };
}

/**
 * Batch test environment manager for running multiple tests with shared setup
 */
export class ServerTestManager<
  TServer extends TestServer = TestServer,
  TClient extends TestClient = TestClient,
> {
  private environment: ServerTestEnvironment<TServer, TClient> | null = null;

  constructor(
    private startServer: ServerStartupFunction<TServer>,
    private createClient: ClientFactory<TClient>,
    private config: ServerTestConfig = DEFAULT_SERVER_TEST_CONFIG,
  ) {}

  /**
   * Setup the test environment (call in before hook)
   */
  async setup(): Promise<ServerTestEnvironment<TServer, TClient>> {
    if (this.environment) {
      throw new Error("Test environment already setup");
    }

    this.environment = await createServerTestEnvironment(
      this.startServer,
      this.createClient,
      this.config,
    );

    return this.environment;
  }

  /**
   * Get the current test environment
   */
  getEnvironment(): ServerTestEnvironment<TServer, TClient> {
    if (!this.environment) {
      throw new Error("Test environment not setup. Call setup() first.");
    }
    return this.environment;
  }

  /**
   * Cleanup the test environment (call in after hook)
   */
  async cleanup(): Promise<void> {
    if (this.environment) {
      await this.environment.cleanup();
      this.environment = null;
    }
  }
}

/**
 * Utility for creating test configurations for different scenarios
 */
export class ServerTestConfigBuilder {
  private config: Partial<ServerTestConfig> = {};

  withPort(port: number): this {
    this.config.port = port;
    return this;
  }

  withTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  withBaseUrl(baseUrl: string): this {
    this.config.baseUrl = baseUrl;
    return this;
  }

  withRandomPort(): this {
    this.config.port = generateTestPort();
    return this;
  }

  build(): ServerTestConfig {
    return {
      ...DEFAULT_SERVER_TEST_CONFIG,
      ...this.config,
    };
  }
}

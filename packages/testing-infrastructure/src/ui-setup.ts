/**
 * UI Test Setup Utilities
 *
 * Provides standardized utilities for setting up UI E2E tests:
 * - Browser automation setup
 * - Application server management
 * - UI test environment configuration
 * - Common UI interaction helpers
 *
 * This module is designed to be generic and work with any web application
 * by accepting server startup functions and configuration as parameters.
 */

/// <reference lib="deno.ns" />

import { type Browser, chromium, type Page } from "playwright";
import type { FetchMockManager, MockScenario } from "./fetch-mock.ts";
import type { TestServer } from "./server-setup.ts";

/**
 * UI Test configuration interface
 */
export interface UITestConfig {
  // Server configuration
  apiServerPort: number;
  webAppPort: number;
  apiServerUrl: string;
  webAppUrl: string;

  // Browser configuration
  timeout: number;
  headless: boolean;

  // Optional custom configuration
  customEnvVars?: Record<string, string>;
}

/**
 * UI Test environment interface
 */
export interface UITestEnvironment<TServer extends TestServer = TestServer> {
  browser: Browser;
  page: Page;
  apiServer: TServer;
  webServerProcess: Deno.ChildProcess;
  mockManager: FetchMockManager;
  config: UITestConfig;
  consoleErrors: string[];
  pageErrors: string[];
  cleanup: () => Promise<void>;
}

/**
 * Web application startup function type
 */
export type WebAppStartupFunction = (
  config: UITestConfig,
) => Promise<Deno.ChildProcess>;

/**
 * API server startup function type
 */
export type APIServerStartupFunction<TServer extends TestServer = TestServer> =
  () => Promise<TServer>;

/**
 * Create UI test configuration with unique ports
 */
export function createUITestConfig(
  overrides: Partial<UITestConfig> = {},
): UITestConfig {
  const apiServerPort = 8000 + Math.floor(Math.random() * 1000);
  const webAppPort = 5173; // Default Vite port, can be overridden

  return {
    apiServerPort,
    webAppPort,
    apiServerUrl: `http://localhost:${apiServerPort}`,
    webAppUrl: `http://localhost:${webAppPort}`,
    timeout: 30000,
    headless: true, // Set to false to see browser during development
    ...overrides,
  };
}

/**
 * Setup UI test environment with required environment variables
 */
export function setupUITestEnvironment(config: UITestConfig): void {
  // Set test environment variables for API server
  Deno.env.set("NODE_ENV", "test");
  Deno.env.set("PORT", config.apiServerPort.toString());

  // Set common AI provider API keys for testing
  Deno.env.set("OPENAI_API_KEY", "test-openai-key");
  Deno.env.set("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");
  Deno.env.set("OPENROUTER_API_KEY", "test-openrouter-key");
  Deno.env.set("ANTHROPIC_API_KEY", "test-anthropic-key");

  // Set environment variables for web app
  Deno.env.set("VITE_AI_API_URL", config.apiServerUrl);

  // Set any custom environment variables
  if (config.customEnvVars) {
    for (const [key, value] of Object.entries(config.customEnvVars)) {
      Deno.env.set(key, value);
    }
  }
}

/**
 * Default web application startup function using Deno task
 */
export async function defaultWebAppStartup(
  config: UITestConfig,
): Promise<Deno.ChildProcess> {
  console.log(`Starting web application on port ${config.webAppPort}...`);

  const webServerCommand = new Deno.Command("deno", {
    args: ["task", "dev"],
    stdout: "piped",
    stderr: "piped",
  });

  const webServerProcess = webServerCommand.spawn();

  // Wait for web server to be ready
  await waitForWebServer(config.webAppUrl, config.timeout);

  return webServerProcess;
}

/**
 * Wait for web server to be ready
 */
export async function waitForWebServer(
  url: string,
  timeout: number,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      await response.text(); // Consume response body
      if (response.ok) {
        console.log(`Web server ready at ${url}`);
        return;
      }
    } catch {
      // Server not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Web server failed to start within ${timeout}ms`);
}

/**
 * Setup browser for UI testing
 */
export async function setupBrowser(
  config: UITestConfig,
): Promise<{ browser: Browser; page: Page }> {
  console.log("Starting browser...");

  const browser = await chromium.launch({
    headless: config.headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // For CI environments
  });

  const page = await browser.newPage();

  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });

  // Set longer timeout for UI interactions
  page.setDefaultTimeout(config.timeout);

  return { browser, page };
}

/**
 * Setup complete UI test environment
 */
export async function createUITestEnvironment<
  TServer extends TestServer = TestServer,
>(
  apiServerStartup: APIServerStartupFunction<TServer>,
  mockScenario: MockScenario,
  config: UITestConfig = createUITestConfig(),
  webAppStartup: WebAppStartupFunction = defaultWebAppStartup,
): Promise<UITestEnvironment<TServer>> {
  setupUITestEnvironment(config);

  // 1. Setup mocking for external APIs (must be done before server startup)
  const { FetchMockManager } = await import("./fetch-mock.ts");
  const mockManager = new FetchMockManager(mockScenario);
  mockManager.start();

  // 2. Start API server in-process
  console.log("Starting API server...");
  const apiServer = await apiServerStartup();

  // 3. Start web application server
  const webServerProcess = await webAppStartup(config);

  // 4. Setup browser
  const { browser, page } = await setupBrowser(config);

  // 5. Setup console error detection
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  console.log("Setting up console error detection...");

  // Listen for console messages
  page.on("console", (msg) => {
    console.log(`[CONSOLE] ${msg.text()}`);
    if (msg.type() === "error") {
      const errorText = msg.text();
      consoleErrors.push(errorText);
      console.error(`Console error detected: ${errorText}`);
      throw new Error(`Critical console error detected: ${errorText}`);
    }
  });

  // Listen for unhandled page errors (like uncaught exceptions)
  page.on("pageerror", (error) => {
    const errorText = error.message;
    pageErrors.push(errorText);
    console.error(`Page error detected: ${errorText}`);

    // Fail immediately on any page error (these are usually critical)
    throw new Error(`Critical page error detected: ${errorText}`);
  });

  // 6. Navigate to the application and check for console errors
  console.log(`Navigating to ${config.webAppUrl}...`);
  await page.goto(config.webAppUrl);
  console.log("Waiting for console errors...");

  // Wait longer for any console errors to appear (React errors can take time)
  await page.waitForTimeout(5000);

  // Log all errors for debugging
  const allErrors = [...consoleErrors, ...pageErrors];
  if (allErrors.length > 0) {
    console.log(
      `Errors detected - Console: ${consoleErrors.length}, Page: ${pageErrors.length}`,
    );
    console.log("All errors:", allErrors);
  }

  // Check for critical errors that indicate loading failures
  const criticalErrors = allErrors.filter((error) =>
    error.includes("TypeError") ||
    error.includes("ReferenceError") ||
    error.includes("is undefined") ||
    error.includes("Cannot read") ||
    error.includes("Failed to fetch") ||
    error.includes("Network error") ||
    error.includes("ReactSharedInternals") ||
    error.includes("Uncaught")
  );

  if (criticalErrors.length > 0) {
    throw new Error(
      `Website loading failed with critical errors: ${
        criticalErrors.join("; ")
      }`,
    );
  }

  const cleanup = async () => {
    try {
      console.log("Cleaning up UI test environment...");

      // Close browser
      await browser.close();

      // Stop mock manager
      mockManager.stop();

      // Stop API server
      await apiServer.stop();

      // Stop web server and close streams
      try {
        webServerProcess.kill();
        await webServerProcess.stdout.cancel();
        await webServerProcess.stderr.cancel();
        await webServerProcess.status;
      } catch (error) {
        console.warn("Error stopping web server:", error);
      }
    } catch (error) {
      console.warn("Error during UI test cleanup:", error);
    }
  };

  return {
    browser,
    page,
    apiServer,
    webServerProcess,
    mockManager,
    config,
    consoleErrors,
    pageErrors,
    cleanup,
  };
}

/**
 * UI Test helper functions for common interactions
 */
export class UITestHelpers {
  /**
   * Wait for element to be visible and return it
   * Also checks for console errors before waiting
   */
  static async waitForElement(
    page: Page,
    selector: string,
    timeout = 10000,
    consoleErrors?: string[],
  ) {
    // Check for console errors if provided
    if (consoleErrors) {
      this.checkConsoleErrors(consoleErrors, true);
    }

    await page.waitForSelector(selector, { state: "visible", timeout });
    return page.locator(selector);
  }

  /**
   * Check for console errors and throw if critical errors are found
   */
  static checkConsoleErrors(
    consoleErrors: string[],
    throwOnError = true,
  ): string[] {
    const criticalErrors = consoleErrors.filter((error) =>
      error.includes("TypeError") ||
      error.includes("ReferenceError") ||
      error.includes("is undefined") ||
      error.includes("Cannot read") ||
      error.includes("Failed to fetch") ||
      error.includes("Network error") ||
      error.includes("ReactSharedInternals") ||
      error.includes("Uncaught")
    );

    if (criticalErrors.length > 0) {
      console.error(
        `Critical console errors detected: ${criticalErrors.join("; ")}`,
      );
      if (throwOnError) {
        throw new Error(
          `Website has critical console errors: ${criticalErrors.join("; ")}`,
        );
      }
    }

    return criticalErrors;
  }

  /**
   * Type text into an input field
   */
  static async typeText(page: Page, selector: string, text: string) {
    const element = await this.waitForElement(page, selector);
    await element.fill(text);
  }

  /**
   * Click an element
   */
  static async clickElement(page: Page, selector: string) {
    const element = await this.waitForElement(page, selector);
    await element.click();
  }

  /**
   * Select option from dropdown
   */
  static async selectOption(page: Page, selector: string, value: string) {
    const element = await this.waitForElement(page, selector);
    await element.selectOption(value);
  }

  /**
   * Get text content of an element
   */
  static async getTextContent(page: Page, selector: string): Promise<string> {
    const element = await this.waitForElement(page, selector);
    return await element.textContent() || "";
  }

  /**
   * Wait for message to appear in chat (generic selector)
   */
  static async waitForMessage(
    page: Page,
    role: "user" | "assistant",
    timeout = 10000,
  ) {
    await page.waitForSelector(
      `[data-testid^="message-"][data-role="${role}"]`,
      { timeout },
    );
  }

  /**
   * Get all messages from chat (generic selector)
   */
  static async getAllMessages(page: Page) {
    const messages = await page.locator('[data-testid^="message-"]').all();
    const result = [];

    for (const message of messages) {
      const role = await message.getAttribute("data-role");
      const content = await message.textContent();
      if (role && content) {
        result.push({ role, content });
      }
    }

    return result;
  }

  /**
   * Clear the conversation by clicking the Clear Chat button (generic)
   */
  static async clearConversation(page: Page) {
    try {
      // Look for the Clear Chat button and click it
      await page.locator("text=Clear Chat").click();

      // Wait a moment for the clear action to complete
      await page.waitForTimeout(500);

      // Verify the conversation was cleared by checking if welcome message appears
      await page.waitForSelector(
        "text=Start a conversation by typing a message below",
        { timeout: 5000 },
      );
    } catch (error) {
      console.warn("Could not clear conversation:", error);
    }
  }

  /**
   * Wait for loading state to appear and disappear
   */
  static async waitForLoadingComplete(
    page: Page,
    loadingSelector: string = '[data-testid="loading"]',
    timeout = 10000,
  ) {
    try {
      // Wait for loading to appear
      await page.waitForSelector(loadingSelector, { timeout: 2000 });
      // Wait for loading to disappear
      await page.waitForSelector(loadingSelector, { state: "hidden", timeout });
    } catch {
      // Loading might be too fast to detect, which is fine
    }
  }

  /**
   * Take screenshot for debugging
   */
  static async takeScreenshot(page: Page, name: string = "debug") {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `screenshot-${name}-${timestamp}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`Screenshot saved: ${filename}`);
  }
}

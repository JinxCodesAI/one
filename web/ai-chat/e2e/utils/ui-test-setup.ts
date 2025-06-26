/**
 * UI E2E test setup utilities
 * Manages browser automation and application servers
 */

/// <reference lib="deno.ns" />

import { type Browser, chromium, type Page } from "playwright";
import { startServer } from "../../../../internal/ai-api/main.ts";
import type { AIServer } from "../../../../internal/ai-api/server/server.ts";
import { FetchMockManager, type MockScenario } from "./external-mock.ts";

/**
 * UI Test configuration interface
 */
export interface UITestConfig {
  aiApiPort: number;
  webAppPort: number;
  aiApiUrl: string;
  webAppUrl: string;
  timeout: number;
  headless: boolean;
}

/**
 * UI Test environment interface
 */
export interface UITestEnvironment {
  browser: Browser;
  page: Page;
  aiServer: AIServer;
  webServerProcess: Deno.ChildProcess;
  mockManager: FetchMockManager;
  cleanup: () => Promise<void>;
}

/**
 * Create UI test configuration with unique ports
 */
export function createUITestConfig(): UITestConfig {
  const aiApiPort = 8000 + Math.floor(Math.random() * 1000);
  const webAppPort = 5173; // Use default Vite port for now

  return {
    aiApiPort,
    webAppPort,
    aiApiUrl: `http://localhost:${aiApiPort}`,
    webAppUrl: `http://localhost:${webAppPort}`,
    timeout: 30000,
    headless: true, // Set to false to see browser during development
  };
}

/**
 * Setup UI test environment with required environment variables
 */
export function setupUITestEnvironment(config: UITestConfig): void {
  // Set test environment variables for AI API
  Deno.env.set("NODE_ENV", "test");
  Deno.env.set("PORT", config.aiApiPort.toString());
  Deno.env.set("OPENAI_API_KEY", "test-openai-key");
  Deno.env.set("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");
  Deno.env.set("OPENROUTER_API_KEY", "test-openrouter-key");

  // Set environment variables for web app
  Deno.env.set("VITE_AI_API_URL", config.aiApiUrl);
}

/**
 * Start the web application development server
 */
async function startWebApplication(
  config: UITestConfig,
): Promise<Deno.ChildProcess> {
  console.log(`Starting web application on port ${config.webAppPort}...`);

  // Use the current working directory (should be web/ai-chat when running tests)
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
async function waitForWebServer(url: string, timeout: number): Promise<void> {
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
async function setupBrowser(
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
export async function setupUITestEnvironment_Full(
  config: UITestConfig,
  mockScenario: MockScenario,
): Promise<UITestEnvironment> {
  setupUITestEnvironment(config);

  // 1. Setup mocking for external APIs
  const mockManager = new FetchMockManager(mockScenario);
  mockManager.start();

  // 2. Start AI API server in-process
  console.log("Starting AI API server...");
  const aiServer = await startServer();

  // 3. Start web application server
  const webServerProcess = await startWebApplication(config);

  // 4. Setup browser
  const { browser, page } = await setupBrowser(config);

  // 5. Navigate to the application
  console.log(`Navigating to ${config.webAppUrl}...`);
  await page.goto(config.webAppUrl);

  const cleanup = async () => {
    try {
      console.log("Cleaning up UI test environment...");

      // Close browser
      await browser.close();

      // Stop mock manager
      mockManager.stop();

      // Stop AI server
      await aiServer.stop();

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
    aiServer,
    webServerProcess,
    mockManager,
    cleanup,
  };
}

/**
 * Create a mock scenario for successful AI responses in UI tests
 */
export function createUISuccessScenario(
  openaiResponse: string = "Hello! This is GPT-4.1-nano responding.",
  googleResponse: string = "Hello! This is Gemini-2.5-flash responding.",
  anthropicResponse: string = "Hello! This is Claude-3.5-sonnet responding.",
): MockScenario {
  return {
    name: "UI Success Scenario",
    isRequestExpected: (_context, metadata) => {
      return metadata.isExternalApi &&
        ["openai", "google", "openrouter"].includes(metadata.service);
    },
    generateResponse: (context, metadata) => {
      const response = RequestAnalyzer.generateSuccessResponse(
        context,
        metadata,
      );
      const body = response.body as Record<string, unknown>;

      const model = metadata.model;

      if (metadata.service === "openai" && model === "gpt-4.1-nano") {
        (body.choices as Array<{ message: { content: string } }>)[0].message
          .content = openaiResponse;
      } else if (
        metadata.service === "google" && model === "gemini-2.5-flash"
      ) {
        (body.candidates as Array<
          { content: { parts: Array<{ text: string }> } }
        >)[0].content.parts[0].text = googleResponse;
      } else if (
        metadata.service === "openrouter" &&
        model === "anthropic/claude-3.5-sonnet"
      ) {
        (body.choices as Array<{ message: { content: string } }>)[0].message
          .content = anthropicResponse;
      }

      return response;
    },
  };
}

// Import RequestAnalyzer for the mock scenario
import { RequestAnalyzer } from "./external-mock.ts";

/**
 * UI Test helper functions
 */
export class UITestHelpers {
  /**
   * Wait for element to be visible and return it
   */
  static async waitForElement(page: Page, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { state: "visible", timeout });
    return page.locator(selector);
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
   * Wait for message to appear in chat
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
   * Get all messages from chat
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
   * Clear the conversation by clicking the Clear Chat button
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
}

/**
 * Simple UI E2E test to verify application loads correctly
 *
 * Migrated to use shared testing infrastructure from @one/testing-infrastructure
 */

import { after, before, describe, it } from "@std/testing/bdd";
import {
  createUISuccessScenario,
  createUITestConfig,
  createUITestEnvironment,
  type UITestConfig,
  type UITestEnvironment,
  UITestHelpers,
} from "@one/testing-infrastructure";
import { startServer } from "../../../internal/ai-api/main.ts";

describe("UI E2E: Simple Application Load Test", () => {
  let testConfig: UITestConfig;
  let testEnvironment: UITestEnvironment;

  before(async () => {
    testConfig = createUITestConfig();

    // Setup a basic scenario (not needed for load test but required by setup)
    const scenario = createUISuccessScenario();

    testEnvironment = await createUITestEnvironment(
      startServer,
      scenario,
      testConfig,
    );

    console.log("Simple UI E2E test environment ready!");
  });

  after(async () => {
    await testEnvironment.cleanup();
  });

  it("should load the application and show welcome message", async () => {
    const { page } = testEnvironment;

    console.log("Step 1: Check if welcome message is visible");
    await UITestHelpers.waitForElement(
      page,
      "text=Start a conversation by typing a message below",
    );

    console.log("Step 2: Verify model selector is present");
    await UITestHelpers.waitForElement(page, '[data-testid="model-selector"]');

    console.log("Step 3: Verify message input is present");
    await UITestHelpers.waitForElement(page, '[data-testid="message-input"]');

    console.log("Step 4: Verify send button is present");
    await UITestHelpers.waitForElement(page, '[data-testid="send-button"]');

    console.log("✅ Application loaded successfully!");
  });

  it("should show correct welcome text", async () => {
    const { page } = testEnvironment;

    console.log("Step 1: Check for welcome heading");
    await UITestHelpers.waitForElement(page, "text=Welcome to AI Chat");

    console.log("Step 2: Check for instruction text");
    await UITestHelpers.waitForElement(
      page,
      "text=Start a conversation by typing a message below",
    );

    console.log("✅ Welcome text verification passed!");
  });
});

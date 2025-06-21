/**
 * Testing Infrastructure - Main Module
 *
 * Central export point for all testing infrastructure utilities.
 * This provides a single import point for consumers of the testing infrastructure.
 */

// Fetch mocking system
export {
  FetchMockManager,
  RequestAnalyzer,
  type MockResponse,
  type RequestContext,
  type RequestMetadata,
  type RequestValidationHandler,
  type ResponseGenerationHandler,
  type MockScenario,
  type RequestLogEntry
} from "./fetch-mock.ts";

// Server test setup utilities
export {
  setupServerTestEnvironment,
  createServerTestEnvironment,
  createServerTestEnvironmentWithHealthCheck,
  generateTestPort,
  createServerTestConfig,
  waitForServer,
  ServerTestManager,
  ServerTestConfigBuilder,
  DEFAULT_SERVER_TEST_CONFIG,
  type ServerTestConfig,
  type TestServer,
  type TestClient,
  type ServerTestEnvironment,
  type ServerStartupFunction,
  type ClientFactory
} from "./server-setup.ts";

// UI test setup utilities
export {
  createUITestConfig,
  setupUITestEnvironment,
  defaultWebAppStartup,
  waitForWebServer,
  setupBrowser,
  createUITestEnvironment,
  UITestHelpers,
  type UITestConfig,
  type UITestEnvironment,
  type WebAppStartupFunction,
  type APIServerStartupFunction
} from "./ui-setup.ts";

// Common test scenarios
export {
  createSuccessScenario,
  createSingleProviderSuccessScenario,
  createErrorScenario,
  createSlowResponseScenario,
  createNoExternalRequestsScenario,
  createUISuccessScenario,
  createMixedScenario,
  DEFAULT_PROVIDER_RESPONSES,
  type ProviderResponses
} from "./scenarios.ts";

// General test helpers
export {
  TestTiming,
  TestDataGenerator,
  TestEnvironment,
  TestAssertions,
  TestCleanup,
  TestLogger,
  TestRetry
} from "./helpers.ts";

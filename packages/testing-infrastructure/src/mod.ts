/**
 * Testing Infrastructure - Main Module
 *
 * Central export point for all testing infrastructure utilities.
 * This provides a single import point for consumers of the testing infrastructure.
 */

// Fetch mocking system
export {
  FetchMockManager,
  type MockResponse,
  type MockScenario,
  RequestAnalyzer,
  type RequestContext,
  type RequestLogEntry,
  type RequestMetadata,
  type RequestValidationHandler,
  type ResponseGenerationHandler,
} from "./fetch-mock.ts";

// Server test setup utilities
export {
  type ClientFactory,
  createServerTestConfig,
  createServerTestEnvironment,
  createServerTestEnvironmentWithHealthCheck,
  DEFAULT_SERVER_TEST_CONFIG,
  generateTestPort,
  type ServerStartupFunction,
  type ServerTestConfig,
  ServerTestConfigBuilder,
  type ServerTestEnvironment,
  ServerTestManager,
  setupServerTestEnvironment,
  type TestClient,
  type TestServer,
  waitForServer,
} from "./server-setup.ts";

// UI test setup utilities
export {
  type APIServerStartupFunction,
  createUITestConfig,
  createUITestEnvironment,
  defaultWebAppStartup,
  setupBrowser,
  setupUITestEnvironment,
  type UITestConfig,
  type UITestEnvironment,
  UITestHelpers,
  waitForWebServer,
  type WebAppStartupFunction,
} from "./ui-setup.ts";

// Common test scenarios
export {
  createErrorScenario,
  createMixedScenario,
  createNoExternalRequestsScenario,
  createSingleProviderSuccessScenario,
  createSlowResponseScenario,
  createSuccessScenario,
  createUISuccessScenario,
  DEFAULT_PROVIDER_RESPONSES,
  type ProviderResponses,
} from "./scenarios.ts";

// General test helpers
export {
  TestAssertions,
  TestCleanup,
  TestDataGenerator,
  TestEnvironment,
  TestLogger,
  TestRetry,
  TestTiming,
} from "./helpers.ts";

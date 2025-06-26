/**
 * Test setup utilities for React component testing
 */

// Basic DOM setup for testing
if (typeof globalThis.document === "undefined") {
  // Minimal DOM setup for testing
  const mockDocument = {
    createElement: (tagName: string) => ({
      tagName: tagName.toUpperCase(),
      textContent: "",
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      closest: () => null,
      parentElement: null,
      children: [],
      innerHTML: "",
      outerHTML: "",
      value: "",
      disabled: false,
      placeholder: "",
      focus: () => {},
      blur: () => {},
      click: () => {},
      scrollHeight: 100,
      scrollTop: 0,
    }),
    body: {
      innerHTML: "",
      appendChild: () => {},
      removeChild: () => {},
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  (globalThis as unknown as { document: typeof mockDocument }).document =
    mockDocument;
}

// Mock CSS properties are handled in the mock document above

// Mock ResizeObserver
(globalThis as unknown as { ResizeObserver: typeof ResizeObserver })
  .ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;

// Mock IntersectionObserver
(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver })
  .IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds = [];

    constructor(
      _callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as typeof IntersectionObserver;

// Mock matchMedia
globalThis.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

/**
 * Global test cleanup
 */
export function globalTestCleanup() {
  // Clear document body if it exists
  if (globalThis.document?.body) {
    globalThis.document.body.innerHTML = "";
  }

  // Clear any timers
  const timers = (globalThis as unknown as { __timers?: number[] }).__timers;
  if (timers) {
    timers.forEach((timer: number) => clearTimeout(timer));
  }
}

/**
 * Mock fetch for component tests
 */
export function mockFetch(responses: Record<string, unknown>) {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (
    input: string | Request | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();

    // Check if we have a mock response for this URL
    for (const [pattern, response] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        return Promise.resolve(
          new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
    }

    // Fallback to original fetch or throw error
    if (originalFetch) {
      return originalFetch(input, init);
    }

    return Promise.reject(new Error(`No mock response found for: ${url}`));
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}

interface MockAIClient {
  generateText: () => Promise<{
    content: string;
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
  getModels: () => Promise<string[]>;
  getHealth: () => Promise<{
    status: string;
    models: string[];
    version: string;
  }>;
}

/**
 * Create mock AI client for testing
 */
export function createMockAIClient(
  overrides: Partial<MockAIClient> = {},
): MockAIClient {
  return {
    generateText: () =>
      Promise.resolve({
        content: "Test AI response",
        model: "gpt-4.1-nano",
        usage: {
          promptTokens: 10,
          completionTokens: 8,
          totalTokens: 18,
        },
      }),
    getModels: () => Promise.resolve(["gpt-4.1-nano", "gemini-2.5-flash"]),
    getHealth: () =>
      Promise.resolve({
        status: "healthy",
        models: ["gpt-4.1-nano", "gemini-2.5-flash"],
        version: "0.0.1",
      }),
    ...overrides,
  };
}

/**
 * Create mock messages for testing
 */
export function createMockMessages() {
  return [
    {
      role: "user" as const,
      content: "Hello, how are you?",
      timestamp: new Date("2025-01-01T10:00:00Z"),
    },
    {
      role: "assistant" as const,
      content:
        "Hello! I'm doing well, thank you for asking. How can I help you today?",
      timestamp: new Date("2025-01-01T10:00:01Z"),
    },
    {
      role: "user" as const,
      content: "Can you help me with a coding problem?",
      timestamp: new Date("2025-01-01T10:00:02Z"),
    },
  ];
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const originalConsole = { ...console };
  const logs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log = (...args: unknown[]) => {
    logs.push(args.join(" "));
  };

  console.error = (...args: unknown[]) => {
    errors.push(args.join(" "));
  };

  console.warn = (...args: unknown[]) => {
    warnings.push(args.join(" "));
  };

  return {
    logs,
    errors,
    warnings,
    restore: () => {
      Object.assign(console, originalConsole);
    },
  };
}

/**
 * Create a test wrapper component for providers
 */
export function createTestWrapper(_props: Record<string, unknown> = {}) {
  return function TestWrapper({ children }: { children: unknown }) {
    // Simple wrapper for testing - JSX not needed in test utils
    return children;
  };
}

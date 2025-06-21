/**
 * General Test Helpers and Utilities
 *
 * Common utility functions and helpers that can be used across different
 * types of tests (unit, integration, E2E) to reduce duplication and
 * provide consistent testing patterns.
 */

/**
 * Test timing utilities
 */
export class TestTiming {
  /**
   * Wait for a specified amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Wait for a condition to be true with timeout
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.wait(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }
  
  /**
   * Measure execution time of a function
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const duration = performance.now() - startTime;
    return { result, duration };
  }
}

/**
 * Test data generation utilities
 */
export class TestDataGenerator {
  /**
   * Generate a random string of specified length
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Generate a random email address
   */
  static randomEmail(): string {
    return `test-${this.randomString(8)}@example.com`;
  }
  
  /**
   * Generate a random UUID-like string
   */
  static randomId(): string {
    return 'test-' + this.randomString(16);
  }
  
  /**
   * Generate random chat messages for testing
   */
  static randomChatMessages(count: number = 3): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages = [];
    for (let i = 0; i < count; i++) {
      messages.push({
        role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `Test message ${i + 1}: ${this.randomString(20)}`
      });
    }
    return messages;
  }
  
  /**
   * Generate test model names
   */
  static getTestModels(): string[] {
    return [
      'gpt-4.1-nano',
      'gemini-2.5-flash',
      'anthropic/claude-3.5-sonnet'
    ];
  }
}

/**
 * Environment utilities for testing
 */
export class TestEnvironment {
  private static originalEnv: Record<string, string | undefined> = {};
  
  /**
   * Set environment variables for testing and remember original values
   */
  static setEnvVars(vars: Record<string, string>): void {
    for (const [key, value] of Object.entries(vars)) {
      if (!(key in this.originalEnv)) {
        this.originalEnv[key] = Deno.env.get(key);
      }
      Deno.env.set(key, value);
    }
  }
  
  /**
   * Restore original environment variables
   */
  static restoreEnvVars(): void {
    for (const [key, originalValue] of Object.entries(this.originalEnv)) {
      if (originalValue === undefined) {
        Deno.env.delete(key);
      } else {
        Deno.env.set(key, originalValue);
      }
    }
    this.originalEnv = {};
  }
  
  /**
   * Get common test environment variables
   */
  static getTestEnvVars(): Record<string, string> {
    return {
      'NODE_ENV': 'test',
      'OPENAI_API_KEY': 'test-openai-key',
      'GOOGLE_GENERATIVE_AI_API_KEY': 'test-google-key',
      'OPENROUTER_API_KEY': 'test-openrouter-key',
      'ANTHROPIC_API_KEY': 'test-anthropic-key'
    };
  }
}

/**
 * Assertion helpers for common testing patterns
 */
export class TestAssertions {
  /**
   * Assert that a value is defined (not null or undefined)
   */
  static assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
    if (value === null || value === undefined) {
      throw new Error(message || `Expected value to be defined, got ${value}`);
    }
  }
  
  /**
   * Assert that a string contains a substring
   */
  static assertContains(haystack: string, needle: string, message?: string): void {
    if (!haystack.includes(needle)) {
      throw new Error(message || `Expected "${haystack}" to contain "${needle}"`);
    }
  }
  
  /**
   * Assert that an array has a specific length
   */
  static assertLength<T>(array: T[], expectedLength: number, message?: string): void {
    if (array.length !== expectedLength) {
      throw new Error(message || `Expected array length ${expectedLength}, got ${array.length}`);
    }
  }
  
  /**
   * Assert that a value matches a pattern
   */
  static assertMatches(value: string, pattern: RegExp, message?: string): void {
    if (!pattern.test(value)) {
      throw new Error(message || `Expected "${value}" to match pattern ${pattern}`);
    }
  }
  
  /**
   * Assert that a function throws an error
   */
  static async assertThrows(
    fn: () => Promise<unknown> | unknown,
    expectedError?: string | RegExp | (new (...args: any[]) => Error),
    message?: string
  ): Promise<void> {
    let thrown = false;
    let error: unknown;
    
    try {
      await fn();
    } catch (e) {
      thrown = true;
      error = e;
    }
    
    if (!thrown) {
      throw new Error(message || 'Expected function to throw an error');
    }
    
    if (expectedError) {
      if (typeof expectedError === 'string') {
        TestAssertions.assertContains(String(error), expectedError);
      } else if (expectedError instanceof RegExp) {
        TestAssertions.assertMatches(String(error), expectedError);
      } else if (typeof expectedError === 'function') {
        if (!(error instanceof expectedError)) {
          throw new Error(`Expected error to be instance of ${expectedError.name}`);
        }
      }
    }
  }
}

/**
 * Test cleanup utilities
 */
export class TestCleanup {
  private static cleanupFunctions: Array<() => Promise<void> | void> = [];
  
  /**
   * Register a cleanup function to be called later
   */
  static register(cleanupFn: () => Promise<void> | void): void {
    this.cleanupFunctions.push(cleanupFn);
  }
  
  /**
   * Run all registered cleanup functions
   */
  static async runAll(): Promise<void> {
    const errors: Error[] = [];
    
    for (const cleanupFn of this.cleanupFunctions) {
      try {
        await cleanupFn();
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    this.cleanupFunctions = [];
    
    if (errors.length > 0) {
      throw new Error(`Cleanup errors: ${errors.map(e => e.message).join(', ')}`);
    }
  }
  
  /**
   * Clear all registered cleanup functions without running them
   */
  static clear(): void {
    this.cleanupFunctions = [];
  }
}

/**
 * Test logging utilities
 */
export class TestLogger {
  private static logs: Array<{ level: string; message: string; timestamp: number }> = [];
  
  /**
   * Log a test message
   */
  static log(level: 'info' | 'warn' | 'error', message: string): void {
    const entry = { level, message, timestamp: Date.now() };
    this.logs.push(entry);
    console.log(`[TEST-${level.toUpperCase()}] ${message}`);
  }
  
  /**
   * Log info message
   */
  static info(message: string): void {
    this.log('info', message);
  }
  
  /**
   * Log warning message
   */
  static warn(message: string): void {
    this.log('warn', message);
  }
  
  /**
   * Log error message
   */
  static error(message: string): void {
    this.log('error', message);
  }
  
  /**
   * Get all logged messages
   */
  static getLogs(): Array<{ level: string; message: string; timestamp: number }> {
    return [...this.logs];
  }
  
  /**
   * Clear all logged messages
   */
  static clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Retry utilities for flaky tests
 */
export class TestRetry {
  /**
   * Retry a function with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        TestLogger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`);
        await TestTiming.wait(delay);
      }
    }
    
    throw lastError!;
  }
}

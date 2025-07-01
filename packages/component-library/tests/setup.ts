/**
 * Test Setup for Component Library
 * 
 * Configures testing environment following the comprehensive testing guide
 */

import { TestEnvironment, TestLogger } from "../../testing-infrastructure/src/mod.ts";

// Configure test environment
export const testEnv = new TestEnvironment({
  name: "component-library",
  logLevel: "info",
  timeout: 30000,
});

// Configure test logger
export const testLogger = new TestLogger("component-library");

// Mock DOM environment for component testing
export function setupDOMEnvironment() {
  // Basic DOM globals for testing
  (globalThis as any).window = {
    location: { href: "http://localhost:3000" },
    document: {
      createElement: () => ({ style: {} }),
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  };

  (globalThis as any).document = (globalThis as any).window.document;
  (globalThis as any).navigator = {
    userAgent: "test",
  };
}

// Mock React environment
export function setupReactEnvironment() {
  // Mock React for component testing
  (globalThis as any).React = {
    createElement: (type: any, props: any, ...children: any[]) => ({
      type,
      props: { ...props, children },
    }),
    forwardRef: (fn: any) => fn,
    useState: (initial: any) => [initial, () => {}],
    useEffect: () => {},
    useRef: () => ({ current: null }),
    useMemo: (fn: any) => fn(),
    useCallback: (fn: any) => fn,
  };
}

// Component test utilities
export class ComponentTestUtils {
  static createMockProps<T>(overrides: Partial<T> = {}): T {
    return {
      ...overrides,
    } as T;
  }

  static simulateEvent(eventType: string, target: any, eventData: any = {}) {
    const event = {
      type: eventType,
      target,
      currentTarget: target,
      preventDefault: () => {},
      stopPropagation: () => {},
      ...eventData,
    };
    
    if (target[`on${eventType}`]) {
      target[`on${eventType}`](event);
    }
    
    return event;
  }

  static createMockElement(tagName: string, attributes: Record<string, any> = {}) {
    return {
      tagName: tagName.toUpperCase(),
      attributes,
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {},
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      focus: () => {},
      blur: () => {},
      click: () => {},
      ...attributes,
    };
  }
}

// Accessibility testing utilities
export class AccessibilityTestUtils {
  static checkAriaAttributes(element: any, expectedAttributes: Record<string, string>) {
    const results: { attribute: string; expected: string; actual: string; passed: boolean }[] = [];
    
    for (const [attr, expected] of Object.entries(expectedAttributes)) {
      const actual = element.getAttribute?.(attr) || element[attr] || "";
      const passed = actual === expected;
      
      results.push({
        attribute: attr,
        expected,
        actual,
        passed,
      });
    }
    
    return results;
  }

  static checkKeyboardNavigation(element: any, expectedKeys: string[]) {
    const results: { key: string; handled: boolean }[] = [];
    
    for (const key of expectedKeys) {
      const event = ComponentTestUtils.simulateEvent("keydown", element, { key });
      const handled = event.defaultPrevented || element.onKeyDown?.(event);
      
      results.push({
        key,
        handled: !!handled,
      });
    }
    
    return results;
  }

  static checkFocusManagement(element: any) {
    return {
      canReceiveFocus: element.tabIndex !== undefined && element.tabIndex >= -1,
      hasVisibleFocus: element.style?.outline !== "none",
      hasAriaLabel: !!(element["aria-label"] || element["aria-labelledby"]),
    };
  }
}

// Visual regression testing utilities
export class VisualTestUtils {
  static captureComponentSnapshot(component: any, props: any) {
    // Simulate component rendering and capture visual properties
    return {
      type: component.name || "Component",
      props,
      styles: this.extractStyles(component, props),
      dimensions: this.calculateDimensions(component, props),
      timestamp: Date.now(),
    };
  }

  private static extractStyles(component: any, props: any) {
    // Extract computed styles based on component props
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    };

    // Add variant-specific styles
    if (props.variant) {
      baseStyles[`variant-${props.variant}`] = true;
    }

    if (props.size) {
      baseStyles[`size-${props.size}`] = true;
    }

    return baseStyles;
  }

  private static calculateDimensions(component: any, props: any) {
    // Calculate expected dimensions based on props
    const baseDimensions = { width: 100, height: 40 };

    if (props.size === "sm") {
      baseDimensions.height = 32;
    } else if (props.size === "lg") {
      baseDimensions.height = 48;
    }

    if (props.fullWidth) {
      baseDimensions.width = "100%";
    }

    return baseDimensions;
  }

  static compareSnapshots(snapshot1: any, snapshot2: any) {
    const differences: string[] = [];

    // Compare styles
    const styles1 = JSON.stringify(snapshot1.styles);
    const styles2 = JSON.stringify(snapshot2.styles);
    if (styles1 !== styles2) {
      differences.push("styles");
    }

    // Compare dimensions
    const dims1 = JSON.stringify(snapshot1.dimensions);
    const dims2 = JSON.stringify(snapshot2.dimensions);
    if (dims1 !== dims2) {
      differences.push("dimensions");
    }

    return {
      identical: differences.length === 0,
      differences,
    };
  }
}

// Performance testing utilities
export class PerformanceTestUtils {
  static measureRenderTime(renderFn: () => any) {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    return {
      result,
      renderTime: end - start,
    };
  }

  static measureMemoryUsage(testFn: () => void) {
    // Simulate memory measurement
    const beforeMemory = this.getMemoryUsage();
    testFn();
    const afterMemory = this.getMemoryUsage();
    
    return {
      before: beforeMemory,
      after: afterMemory,
      delta: afterMemory - beforeMemory,
    };
  }

  private static getMemoryUsage(): number {
    // Simulate memory usage measurement
    return Math.random() * 1000000; // Mock memory usage in bytes
  }
}

// Initialize test environment
export function initializeTestEnvironment() {
  setupDOMEnvironment();
  setupReactEnvironment();
  testLogger.info("Test environment initialized");
}

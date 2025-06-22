/**
 * Basic setup test to verify testing infrastructure works
 */

import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import "../test-utils/setup.ts";

describe("Test Setup", () => {
  it("should have basic testing infrastructure working", () => {
    assertEquals(1 + 1, 2);
  });

  it("should have DOM environment available", () => {
    assertExists(globalThis.document);
  });

  it("should have fetch available", () => {
    assertExists(globalThis.fetch);
  });

  it("should be able to create DOM elements", () => {
    const div = document.createElement("div");
    div.textContent = "Test element";

    assertExists(div);
    assertEquals(div.textContent, "Test element");
  });

  it("should have testing environment configured", () => {
    // Verify that our test environment is properly set up
    assertEquals(typeof globalThis.ResizeObserver, "function");
    assertEquals(typeof globalThis.IntersectionObserver, "function");
    assertEquals(typeof globalThis.matchMedia, "function");
  });
});

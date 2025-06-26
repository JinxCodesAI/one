
/**
 * Profile Service Client SDK Tests
 *
 * Unit tests for the ProfileServiceClient.
 */

import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { assertEquals, assertExists, assertRejects, assert } from "@std/assert";
import { ProfileServiceClient } from "./client.ts";
import type { ProfileSDKConfig } from "../types.ts";

describe("ProfileServiceClient", () => {
  let client: ProfileServiceClient;
  let config: Partial<ProfileSDKConfig>;
  let originalDocument: any;
  let originalWindow: any;

  beforeEach(() => {
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;

    // Mock a minimal document and window object
    globalThis.document = {
      cookie: "",
      createElement: (tagName: string) => {
        if (tagName === "iframe") {
          return {
            style: {},
            src: "",
            contentWindow: {
              postMessage: () => {},
            } as unknown as Window,
          } as unknown as HTMLIFrameElement;
        }
        return {} as unknown as HTMLElement;
      },
      querySelector: () => null as unknown as Element,
      body: {
        appendChild: () => {},
      } as unknown as HTMLBodyElement,
    } as unknown as Document;
    globalThis.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      postMessage: () => {},
    } as unknown as Window & typeof globalThis;

    config = {
      profileServiceUrl: "http://localhost:8080",
    };
    client = new ProfileServiceClient(config);
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
    // Clear cookies after each test
    if (globalThis.document && globalThis.document.cookie) {
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
  });

  describe("Initialization", () => {
    it("should create a new instance with default config", () => {
      const defaultConfigClient = new ProfileServiceClient();
      assertEquals(defaultConfigClient.getConfig().profileServiceUrl, "https://profile.jinxcodes.ai");
    });

    it("should create a new instance with custom config", () => {
      assertEquals(client.getConfig().profileServiceUrl, "http://localhost:8080");
    });
  });

  describe("getAnonId", () => {
    it("should return anonId from cookie if it exists", async () => {
      document.cookie = "anon_id=cookie-id";
      const anonId = await client.getAnonId();
      assertEquals(anonId, "cookie-id");
    });

    it("should generate a new anonId if no cookie or iframe id exists", async () => {
      const anonId = await client.getAnonId();
      assertExists(anonId);
      assertEquals(anonId.length, 36); // UUID length
    });
  });

  describe("callApi", () => {
    it("should make a GET request with the X-Anon-Id header", async () => {
      const mockFetch = self.fetch;
      self.fetch = async (url, options?: RequestInit) => {
        if (!options) throw new Error("Request options are undefined");
        assertEquals(url, "http://localhost:8080/api/userinfo");
        assertEquals(options.method, "GET");
        assertEquals((options.headers as Record<string, string>)["X-Anon-Id"], "test-id");
        return new Response(JSON.stringify({ id: "user-1" }));
      };

      client.setAnonId("test-id");
      const result: { id: string } = await client.callApi("GET", "/userinfo");
      assertEquals(result.id, "user-1");

      self.fetch = mockFetch;
    });
  });

  describe("Cookie Management", () => {
    it("should get a cookie by name", () => {
      document.cookie = "test_cookie=test_value";
      const value = client.getCookie("test_cookie");
      assertEquals(value, "test_value");
    });

    it("should return null if cookie not found", () => {
      const value = client.getCookie("non_existent_cookie");
      assertEquals(value, null);
    });

    it("should set a cookie", () => {
      client.setCookie("my_cookie", "my_value");
      assert(document.cookie.includes("my_cookie=my_value"));
    });
  });
});

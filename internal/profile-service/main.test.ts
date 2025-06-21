/**
 * Main Entry Point Tests
 * 
 * Unit tests for the main entry point and configuration loading.
 */

import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import { loadConfig } from "./main.ts";

describe("Main Entry Point", () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // Save original environment
    originalEnv = {
      PORT: Deno.env.get("PORT"),
      DATABASE_URL: Deno.env.get("DATABASE_URL"),
      CORS_ORIGINS: Deno.env.get("CORS_ORIGINS"),
      COOKIE_DOMAIN: Deno.env.get("COOKIE_DOMAIN"),
      DAILY_BONUS_AMOUNT: Deno.env.get("DAILY_BONUS_AMOUNT"),
      INITIAL_CREDITS_AMOUNT: Deno.env.get("INITIAL_CREDITS_AMOUNT")
    };
  });

  afterEach(() => {
    // Restore original environment
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        Deno.env.delete(key);
      } else {
        Deno.env.set(key, value);
      }
    }
  });

  describe("Configuration Loading", () => {
    it("should load default configuration", async () => {
      // Clear all environment variables
      Deno.env.delete("PORT");
      Deno.env.delete("DATABASE_URL");
      Deno.env.delete("CORS_ORIGINS");
      Deno.env.delete("COOKIE_DOMAIN");
      Deno.env.delete("DAILY_BONUS_AMOUNT");
      Deno.env.delete("INITIAL_CREDITS_AMOUNT");

      const config = await loadConfig();

      assertEquals(config.port, 8080);
      assertEquals(config.databaseUrl, undefined);
      assertEquals(config.corsOrigins, ["https://*.jinxcodes.ai", "http://localhost:*"]);
      assertEquals(config.cookieDomain, ".jinxcodes.ai");
      assertEquals(config.dailyBonusAmount, 10);
      assertEquals(config.initialCreditsAmount, 100);
    });

    it("should load configuration from environment variables", async () => {
      Deno.env.set("PORT", "3000");
      Deno.env.set("DATABASE_URL", "postgresql://localhost/test");
      Deno.env.set("CORS_ORIGINS", "https://example.com,https://test.com");
      Deno.env.set("COOKIE_DOMAIN", ".example.com");
      Deno.env.set("DAILY_BONUS_AMOUNT", "20");
      Deno.env.set("INITIAL_CREDITS_AMOUNT", "200");

      const config = await loadConfig();

      assertEquals(config.port, 3000);
      assertEquals(config.databaseUrl, "postgresql://localhost/test");
      assertEquals(config.corsOrigins, ["https://example.com", "https://test.com"]);
      assertEquals(config.cookieDomain, ".example.com");
      assertEquals(config.dailyBonusAmount, 20);
      assertEquals(config.initialCreditsAmount, 200);
    });

    it("should handle partial environment configuration", async () => {
      Deno.env.set("PORT", "4000");
      Deno.env.set("DATABASE_URL", "postgresql://localhost/partial");
      // Leave other variables as defaults

      const config = await loadConfig();

      assertEquals(config.port, 4000);
      assertEquals(config.databaseUrl, "postgresql://localhost/partial");
      assertEquals(config.corsOrigins, ["https://*.jinxcodes.ai", "http://localhost:*"]);
      assertEquals(config.cookieDomain, ".jinxcodes.ai");
      assertEquals(config.dailyBonusAmount, 10);
      assertEquals(config.initialCreditsAmount, 100);
    });

    it("should handle invalid numeric environment variables", async () => {
      Deno.env.set("PORT", "invalid");
      Deno.env.set("DAILY_BONUS_AMOUNT", "not-a-number");
      Deno.env.set("INITIAL_CREDITS_AMOUNT", "also-invalid");

      const config = await loadConfig();

      // Should fall back to NaN for invalid numbers, which becomes falsy
      assertEquals(isNaN(config.port), true);
      assertEquals(isNaN(config.dailyBonusAmount), true);
      assertEquals(isNaN(config.initialCreditsAmount), true);
    });

    it("should parse CORS origins correctly", async () => {
      Deno.env.set("CORS_ORIGINS", "https://app1.example.com,https://app2.example.com,http://localhost:3000");

      const config = await loadConfig();

      assertEquals(config.corsOrigins.length, 3);
      assertEquals(config.corsOrigins[0], "https://app1.example.com");
      assertEquals(config.corsOrigins[1], "https://app2.example.com");
      assertEquals(config.corsOrigins[2], "http://localhost:3000");
    });

    it("should handle empty CORS origins", async () => {
      Deno.env.set("CORS_ORIGINS", "");

      const config = await loadConfig();

      assertEquals(config.corsOrigins, [""]);
    });

    it("should handle single CORS origin", async () => {
      Deno.env.set("CORS_ORIGINS", "https://single.example.com");

      const config = await loadConfig();

      assertEquals(config.corsOrigins, ["https://single.example.com"]);
    });
  });

  describe("Configuration Validation", () => {
    it("should have valid default port", async () => {
      Deno.env.delete("PORT");
      
      const config = await loadConfig();
      
      assertEquals(typeof config.port, "number");
      assertEquals(config.port > 0, true);
      assertEquals(config.port < 65536, true);
    });

    it("should have valid default CORS origins", async () => {
      Deno.env.delete("CORS_ORIGINS");
      
      const config = await loadConfig();
      
      assertEquals(Array.isArray(config.corsOrigins), true);
      assertEquals(config.corsOrigins.length > 0, true);
      assertEquals(config.corsOrigins.every(origin => typeof origin === "string"), true);
    });

    it("should have valid default cookie domain", async () => {
      Deno.env.delete("COOKIE_DOMAIN");
      
      const config = await loadConfig();
      
      assertEquals(typeof config.cookieDomain, "string");
      assertEquals(config.cookieDomain.startsWith("."), true);
    });

    it("should have valid default credit amounts", async () => {
      Deno.env.delete("DAILY_BONUS_AMOUNT");
      Deno.env.delete("INITIAL_CREDITS_AMOUNT");
      
      const config = await loadConfig();
      
      assertEquals(typeof config.dailyBonusAmount, "number");
      assertEquals(typeof config.initialCreditsAmount, "number");
      assertEquals(config.dailyBonusAmount > 0, true);
      assertEquals(config.initialCreditsAmount >= 0, true);
    });
  });
});

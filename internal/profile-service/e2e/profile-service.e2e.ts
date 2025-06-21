/**
 * Profile Service E2E Tests
 * 
 * End-to-end tests for the complete profile service functionality.
 */

import { describe, it, before, after } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import {
  createServerTestEnvironment,
  generateTestPort,
  type ServerTestEnvironment
} from "@one/testing-infrastructure";
import { createDatabaseAdapter } from "../database/mod.ts";
import { startServer } from "../server/server.ts";
import type { ProfileServiceConfig, UserInfoResponse, CreditsResponse } from "../types.ts";

describe("E2E: Profile Service", () => {
  let testEnv: ServerTestEnvironment;
  let baseUrl: string;
  const testAnonId = "e2e-test-anon-id";

  before(async () => {
    const port = generateTestPort();
    baseUrl = `http://localhost:${port}`;

    const config: ProfileServiceConfig = {
      port,
      corsOrigins: ["*"],
      cookieDomain: ".localhost",
      dailyBonusAmount: 10,
      initialCreditsAmount: 100
    };

    const db = createDatabaseAdapter(); // Uses memory adapter
    
    const serverStartup = async () => {
      return await startServer(db, config);
    };

    testEnv = await createServerTestEnvironment(serverStartup, () => null);
  });

  after(async () => {
    if (testEnv?.cleanup) {
      await testEnv.cleanup();
    }
  });

  describe("User Profile Management", () => {
    it("should create new user and return profile", async () => {
      const response = await fetch(`${baseUrl}/api/userinfo`, {
        headers: { "X-Anon-Id": testAnonId }
      });

      assertEquals(response.status, 200);
      
      const data: UserInfoResponse = await response.json();
      assertEquals(data.anonId, testAnonId);
      assertEquals(data.userId, null);
      assertEquals(data.name, null);
      assertEquals(data.avatarUrl, null);
      assertExists(data.createdAt);
      assertExists(data.updatedAt);
    });

    it("should update user profile", async () => {
      const updates = {
        name: "E2E Test User",
        avatarUrl: "https://example.com/avatar.jpg"
      };

      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });

      assertEquals(response.status, 200);
      
      const data: UserInfoResponse = await response.json();
      assertEquals(data.name, "E2E Test User");
      assertEquals(data.avatarUrl, "https://example.com/avatar.jpg");
    });

    it("should retrieve updated profile", async () => {
      const response = await fetch(`${baseUrl}/api/profile`, {
        headers: { "X-Anon-Id": testAnonId }
      });

      assertEquals(response.status, 200);
      
      const data: UserInfoResponse = await response.json();
      assertEquals(data.name, "E2E Test User");
      assertEquals(data.avatarUrl, "https://example.com/avatar.jpg");
    });
  });

  describe("Credits Management", () => {
    it("should return initial credits", async () => {
      const response = await fetch(`${baseUrl}/api/credits`, {
        headers: { "X-Anon-Id": testAnonId }
      });

      assertEquals(response.status, 200);
      
      const data: CreditsResponse = await response.json();
      assertEquals(data.balance, 100); // Initial credits
      assertEquals(data.ledger.length, 1);
      assertEquals(data.ledger[0].type, "initial");
      assertEquals(data.ledger[0].amount, 100);
    });

    it("should award daily bonus", async () => {
      const response = await fetch(`${baseUrl}/api/credits/daily-award`, {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      assertEquals(response.status, 200);
      
      const data: CreditsResponse = await response.json();
      assertEquals(data.balance, 110); // 100 + 10 daily bonus
      assertEquals(data.ledger.length, 2);
      
      // Find daily bonus entry
      const dailyBonus = data.ledger.find(entry => entry.type === "daily_bonus");
      assertExists(dailyBonus);
      assertEquals(dailyBonus.amount, 10);
    });

    it("should adjust credits", async () => {
      const adjustment = {
        amount: 25,
        reason: "E2E test bonus"
      };

      const response = await fetch(`${baseUrl}/api/credits/adjust`, {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(adjustment)
      });

      assertEquals(response.status, 200);
      
      const data: CreditsResponse = await response.json();
      assertEquals(data.balance, 135); // 110 + 25
      assertEquals(data.ledger.length, 3);
      
      // Find adjustment entry
      const adjustEntry = data.ledger.find(entry => entry.type === "adjust");
      assertExists(adjustEntry);
      assertEquals(adjustEntry.amount, 25);
      assertEquals(adjustEntry.reason, "E2E test bonus");
    });
  });

  describe("Health Check", () => {
    it("should return healthy status", async () => {
      const response = await fetch(`${baseUrl}/api/healthz`);
      
      assertEquals(response.status, 200);
      
      const data = await response.json();
      assertEquals(data.status, "healthy");
    });

    it("should return healthy status at root", async () => {
      const response = await fetch(`${baseUrl}/`);
      
      assertEquals(response.status, 200);
      
      const data = await response.json();
      assertEquals(data.status, "healthy");
    });
  });

  describe("Static Files", () => {
    it("should serve storage.html", async () => {
      const response = await fetch(`${baseUrl}/storage.html`);
      
      assertEquals(response.status, 200);
      assertEquals(response.headers.get("content-type"), "text/html");
      
      const html = await response.text();
      assertEquals(html.includes("Iframe Storage Protocol"), true);
      assertEquals(html.includes("window.addEventListener"), true);
    });
  });

  describe("CORS Headers", () => {
    it("should include CORS headers in API responses", async () => {
      const response = await fetch(`${baseUrl}/api/userinfo`, {
        headers: { 
          "X-Anon-Id": testAnonId,
          "Origin": "https://app.jinxcodes.ai"
        }
      });

      assertEquals(response.status, 200);
      assertEquals(response.headers.get("access-control-allow-origin"), "https://app.jinxcodes.ai");
      assertEquals(response.headers.get("access-control-allow-credentials"), "true");
    });

    it("should handle preflight requests", async () => {
      const response = await fetch(`${baseUrl}/api/userinfo`, {
        method: "OPTIONS",
        headers: {
          "Origin": "https://app.jinxcodes.ai",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type, X-Anon-Id"
        }
      });

      assertEquals(response.status, 204);
      assertEquals(response.headers.get("access-control-allow-origin"), "https://app.jinxcodes.ai");
      assertEquals(response.headers.get("access-control-allow-methods"), "GET, POST, OPTIONS");
      assertEquals(response.headers.get("access-control-allow-headers"), "Content-Type, X-Anon-Id");
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for unknown API endpoints", async () => {
      const response = await fetch(`${baseUrl}/api/unknown`);
      
      assertEquals(response.status, 404);
      
      const data = await response.json();
      assertEquals(data.error, "API endpoint not found");
    });

    it("should return 404 for unknown static files", async () => {
      const response = await fetch(`${baseUrl}/unknown.html`);
      
      assertEquals(response.status, 404);
    });

    it("should handle invalid JSON in POST requests", async () => {
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: "invalid json"
      });

      assertEquals(response.status, 400);
    });
  });
});

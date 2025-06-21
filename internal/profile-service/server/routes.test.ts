/**
 * API Routes Integration Tests
 * 
 * Integration tests for the profile service API routes.
 */

import { describe, it, beforeEach } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import { ProfileServiceRoutes } from "./routes.ts";
import { MemoryDatabaseAdapter } from "../database/memory-adapter.ts";
import type { ProfileServiceConfig } from "../types.ts";

describe("ProfileServiceRoutes", () => {
  let routes: ProfileServiceRoutes;
  let db: MemoryDatabaseAdapter;
  let config: ProfileServiceConfig;
  const testAnonId = "test-anon-id-123";

  beforeEach(() => {
    db = new MemoryDatabaseAdapter();
    config = {
      port: 8080,
      corsOrigins: ["https://*.jinxcodes.ai"],
      cookieDomain: ".jinxcodes.ai",
      dailyBonusAmount: 10,
      initialCreditsAmount: 100
    };
    routes = new ProfileServiceRoutes(db, config);
  });

  describe("GET /api/userinfo", () => {
    it("should create new user when anon ID not exists", async () => {
      const request = new Request("http://localhost/api/userinfo", {
        headers: { "X-Anon-Id": testAnonId }
      });

      const response = await routes.handleUserInfo(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.anonId, testAnonId);
      assertEquals(data.userId, null);
      assertEquals(data.name, null);
      assertEquals(data.avatarUrl, null);
      assertExists(data.createdAt);
      assertExists(data.updatedAt);
    });

    it("should return existing user", async () => {
      // Create user first
      await db.createUser(testAnonId);
      await db.updateUser(testAnonId, { name: "Test User" });

      const request = new Request("http://localhost/api/userinfo", {
        headers: { "X-Anon-Id": testAnonId }
      });

      const response = await routes.handleUserInfo(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.name, "Test User");
    });

    it("should generate new anon ID when none provided", async () => {
      const request = new Request("http://localhost/api/userinfo");

      const response = await routes.handleUserInfo(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertExists(data.anonId);
      assertEquals(data.anonId.length, 36); // UUID length
    });
  });

  describe("POST /api/profile", () => {
    beforeEach(async () => {
      await db.createUser(testAnonId);
    });

    it("should update user profile", async () => {
      const updates = {
        name: "Updated User",
        avatarUrl: "https://example.com/new-avatar.jpg"
      };

      const request = new Request("http://localhost/api/profile", {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });

      const response = await routes.handleUpdateProfile(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.name, "Updated User");
      assertEquals(data.avatarUrl, "https://example.com/new-avatar.jpg");
    });

    it("should handle partial updates", async () => {
      const updates = { name: "Partial Update" };

      const request = new Request("http://localhost/api/profile", {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });

      const response = await routes.handleUpdateProfile(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.name, "Partial Update");
      assertEquals(data.avatarUrl, null);
    });
  });

  describe("GET /api/credits", () => {
    beforeEach(async () => {
      await db.createUser(testAnonId);
    });

    it("should return credits with empty ledger for new user", async () => {
      const request = new Request("http://localhost/api/credits", {
        headers: { "X-Anon-Id": testAnonId }
      });

      const response = await routes.handleGetCredits(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.balance, 0);
      assertEquals(data.ledger.length, 0);
    });

    it("should return credits with ledger entries", async () => {
      await db.createCredits(testAnonId, 50);
      await db.addCreditLedgerEntry({
        anonId: testAnonId,
        amount: 50,
        type: "initial",
        reason: "Initial credits"
      });

      const request = new Request("http://localhost/api/credits", {
        headers: { "X-Anon-Id": testAnonId }
      });

      const response = await routes.handleGetCredits(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.balance, 50);
      assertEquals(data.ledger.length, 1);
      assertEquals(data.ledger[0].amount, 50);
      assertEquals(data.ledger[0].type, "initial");
    });
  });

  describe("POST /api/credits/daily-award", () => {
    beforeEach(async () => {
      await db.createUser(testAnonId);
      await db.createCredits(testAnonId, 100);
    });

    it("should award daily bonus", async () => {
      const request = new Request("http://localhost/api/credits/daily-award", {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      const response = await routes.handleDailyAward(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.balance, 110); // 100 + 10 daily bonus
      assertEquals(data.ledger.length, 1);
      assertEquals(data.ledger[0].type, "daily_bonus");
      assertEquals(data.ledger[0].amount, 10);
    });

    it("should create credits if not exists", async () => {
      // Remove existing credits
      const anotherAnonId = "another-test-id";
      await db.createUser(anotherAnonId);

      const request = new Request("http://localhost/api/credits/daily-award", {
        method: "POST",
        headers: {
          "X-Anon-Id": anotherAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      const response = await routes.handleDailyAward(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.balance, 10); // 0 + 10 daily bonus
    });
  });

  describe("POST /api/credits/adjust", () => {
    beforeEach(async () => {
      await db.createUser(testAnonId);
      await db.createCredits(testAnonId, 100);
    });

    it("should adjust credits balance", async () => {
      const adjustment = {
        amount: 50,
        reason: "Admin bonus"
      };

      const request = new Request("http://localhost/api/credits/adjust", {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(adjustment)
      });

      const response = await routes.handleCreditAdjust(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.balance, 150); // 100 + 50
      assertEquals(data.ledger.length, 1);
      assertEquals(data.ledger[0].type, "adjust");
      assertEquals(data.ledger[0].amount, 50);
      assertEquals(data.ledger[0].reason, "Admin bonus");
    });

    it("should handle negative adjustments", async () => {
      const adjustment = {
        amount: -25,
        reason: "Penalty"
      };

      const request = new Request("http://localhost/api/credits/adjust", {
        method: "POST",
        headers: {
          "X-Anon-Id": testAnonId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(adjustment)
      });

      const response = await routes.handleCreditAdjust(request);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.balance, 75); // 100 - 25
    });
  });

  describe("GET /api/healthz", () => {
    it("should return healthy status", async () => {
      const response = await routes.handleHealthCheck();
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.status, "healthy");
    });
  });
});

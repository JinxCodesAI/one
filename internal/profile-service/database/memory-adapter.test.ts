/**
 * Memory Database Adapter Tests
 * 
 * Unit tests for the in-memory database adapter implementation.
 */

import { describe, it, beforeEach } from "@std/testing/bdd";
import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { MemoryDatabaseAdapter } from "./memory-adapter.ts";

describe("MemoryDatabaseAdapter", () => {
  let adapter: MemoryDatabaseAdapter;
  const testAnonId = "test-anon-id-123";

  beforeEach(() => {
    adapter = new MemoryDatabaseAdapter();
  });

  describe("User Operations", () => {
    it("should create a new user", async () => {
      const user = await adapter.createUser(testAnonId);
      
      assertEquals(user.anonId, testAnonId);
      assertEquals(user.userId, null);
      assertEquals(user.name, null);
      assertEquals(user.avatarUrl, null);
      assertExists(user.createdAt);
      assertExists(user.updatedAt);
    });

    it("should retrieve a user by anon ID", async () => {
      await adapter.createUser(testAnonId);
      const user = await adapter.getUserByAnonId(testAnonId);
      
      assertExists(user);
      assertEquals(user.anonId, testAnonId);
    });

    it("should return null for non-existent user", async () => {
      const user = await adapter.getUserByAnonId("non-existent");
      assertEquals(user, null);
    });

    it("should update user profile", async () => {
      await adapter.createUser(testAnonId);
      
      const updatedUser = await adapter.updateUser(testAnonId, {
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg"
      });
      
      assertEquals(updatedUser.name, "Test User");
      assertEquals(updatedUser.avatarUrl, "https://example.com/avatar.jpg");
      assertExists(updatedUser.updatedAt);
    });

    it("should throw error when updating non-existent user", async () => {
      await assertRejects(
        async () => {
          await adapter.updateUser("non-existent", { name: "Test" });
        },
        Error,
        "User not found"
      );
    });
  });

  describe("Credits Operations", () => {
    beforeEach(async () => {
      await adapter.createUser(testAnonId);
    });

    it("should create credits with default balance", async () => {
      const credits = await adapter.createCredits(testAnonId);
      
      assertEquals(credits.anonId, testAnonId);
      assertEquals(credits.balance, 0);
      assertExists(credits.updatedAt);
    });

    it("should create credits with initial balance", async () => {
      const credits = await adapter.createCredits(testAnonId, 100);
      
      assertEquals(credits.balance, 100);
    });

    it("should retrieve credits by anon ID", async () => {
      await adapter.createCredits(testAnonId, 50);
      const credits = await adapter.getCredits(testAnonId);
      
      assertExists(credits);
      assertEquals(credits.balance, 50);
    });

    it("should return null for non-existent credits", async () => {
      const credits = await adapter.getCredits("non-existent");
      assertEquals(credits, null);
    });

    it("should update credits balance", async () => {
      await adapter.createCredits(testAnonId, 100);
      
      const updatedCredits = await adapter.updateCreditsBalance(testAnonId, 150);
      
      assertEquals(updatedCredits.balance, 150);
      assertExists(updatedCredits.updatedAt);
    });

    it("should throw error when updating non-existent credits", async () => {
      await assertRejects(
        async () => {
          await adapter.updateCreditsBalance("non-existent", 100);
        },
        Error,
        "Credits not found"
      );
    });
  });

  describe("Ledger Operations", () => {
    beforeEach(async () => {
      await adapter.createUser(testAnonId);
    });

    it("should add credit ledger entry", async () => {
      const entry = await adapter.addCreditLedgerEntry({
        anonId: testAnonId,
        amount: 10,
        type: "daily_bonus",
        reason: "Daily bonus"
      });
      
      assertExists(entry.id);
      assertEquals(entry.anonId, testAnonId);
      assertEquals(entry.amount, 10);
      assertEquals(entry.type, "daily_bonus");
      assertEquals(entry.reason, "Daily bonus");
      assertExists(entry.createdAt);
    });

    it("should retrieve credit ledger for user", async () => {
      // Add multiple entries
      await adapter.addCreditLedgerEntry({
        anonId: testAnonId,
        amount: 100,
        type: "initial",
        reason: "Initial credits"
      });
      
      await adapter.addCreditLedgerEntry({
        anonId: testAnonId,
        amount: 10,
        type: "daily_bonus",
        reason: "Daily bonus"
      });
      
      const ledger = await adapter.getCreditLedger(testAnonId);
      
      assertEquals(ledger.length, 2);
      // Should be sorted by creation date (newest first)
      assertEquals(ledger[0].type, "daily_bonus");
      assertEquals(ledger[1].type, "initial");
    });

    it("should limit ledger entries", async () => {
      // Add 5 entries
      for (let i = 0; i < 5; i++) {
        await adapter.addCreditLedgerEntry({
          anonId: testAnonId,
          amount: i,
          type: "adjust",
          reason: `Entry ${i}`
        });
      }
      
      const ledger = await adapter.getCreditLedger(testAnonId, 3);
      assertEquals(ledger.length, 3);
    });

    it("should return empty ledger for non-existent user", async () => {
      const ledger = await adapter.getCreditLedger("non-existent");
      assertEquals(ledger.length, 0);
    });
  });

  describe("Daily Bonus Tracking", () => {
    beforeEach(async () => {
      await adapter.createUser(testAnonId);
    });

    it("should return null for no previous daily bonus", async () => {
      const lastBonus = await adapter.getLastDailyBonus(testAnonId);
      assertEquals(lastBonus, null);
    });

    it("should track last daily bonus date", async () => {
      const testDate = new Date();
      await (adapter as any).setLastDailyBonus(testAnonId, testDate);
      
      const lastBonus = await adapter.getLastDailyBonus(testAnonId);
      assertEquals(lastBonus?.getTime(), testDate.getTime());
    });
  });

  describe("Health Check", () => {
    it("should always return true for memory adapter", async () => {
      const isHealthy = await adapter.healthCheck();
      assertEquals(isHealthy, true);
    });
  });

  describe("Utility Methods", () => {
    it("should clear all data", async () => {
      await adapter.createUser(testAnonId);
      await adapter.createCredits(testAnonId, 100);
      
      assertEquals(adapter.getUserCount(), 1);
      assertEquals(adapter.getCreditCount(), 1);
      
      adapter.clear();
      
      assertEquals(adapter.getUserCount(), 0);
      assertEquals(adapter.getCreditCount(), 0);
    });

    it("should seed test data", async () => {
      await adapter.seedTestData();
      
      assertEquals(adapter.getUserCount(), 1);
      assertEquals(adapter.getCreditCount(), 1);
      assertEquals(adapter.getLedgerCount(), 3);
      
      const user = await adapter.getUserByAnonId("test-anon-id-123");
      assertExists(user);
      assertEquals(user.name, "Test User");
    });
  });
});

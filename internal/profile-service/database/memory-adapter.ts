/**
 * In-Memory Database Adapter
 * 
 * Simple in-memory implementation for testing and development.
 * Provides the same interface as the PostgreSQL adapter.
 */

import { v4 } from "@std/uuid";
import type {
  DatabaseAdapter,
  User,
  Credits,
  CreditLedgerEntry,
  CreditTransactionType
} from "../types.ts";

export class MemoryDatabaseAdapter implements DatabaseAdapter {
  private users = new Map<string, User>();
  private credits = new Map<string, Credits>();
  private ledger: CreditLedgerEntry[] = [];
  private dailyBonuses = new Map<string, Date>();

  async getUserByAnonId(anonId: string): Promise<User | null> {
    return this.users.get(anonId) || null;
  }

  async createUser(anonId: string): Promise<User> {
    const now = new Date();
    const user: User = {
      anonId,
      userId: null,
      name: null,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(anonId, user);
    return user;
  }

  async updateUser(
    anonId: string, 
    updates: Partial<Pick<User, 'name' | 'avatarUrl'>>
  ): Promise<User> {
    const user = this.users.get(anonId);
    if (!user) {
      throw new Error(`User not found: ${anonId}`);
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(anonId, updatedUser);
    return updatedUser;
  }

  async getCredits(anonId: string): Promise<Credits | null> {
    return this.credits.get(anonId) || null;
  }

  async createCredits(anonId: string, initialBalance = 0): Promise<Credits> {
    const credits: Credits = {
      anonId,
      balance: initialBalance,
      updatedAt: new Date()
    };

    this.credits.set(anonId, credits);
    return credits;
  }

  async updateCreditsBalance(anonId: string, newBalance: number): Promise<Credits> {
    const credits = this.credits.get(anonId);
    if (!credits) {
      throw new Error(`Credits not found: ${anonId}`);
    }

    const updatedCredits: Credits = {
      ...credits,
      balance: newBalance,
      updatedAt: new Date()
    };

    this.credits.set(anonId, updatedCredits);
    return updatedCredits;
  }

  async getCreditLedger(anonId: string, limit = 50): Promise<CreditLedgerEntry[]> {
    return this.ledger
      .filter(entry => entry.anonId === anonId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async addCreditLedgerEntry(
    entry: Omit<CreditLedgerEntry, 'id' | 'createdAt'>
  ): Promise<CreditLedgerEntry> {
    const ledgerEntry: CreditLedgerEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    this.ledger.push(ledgerEntry);
    return ledgerEntry;
  }

  async getLastDailyBonus(anonId: string): Promise<Date | null> {
    return this.dailyBonuses.get(anonId) || null;
  }

  async setLastDailyBonus(anonId: string, date: Date): Promise<void> {
    this.dailyBonuses.set(anonId, date);
  }

  async healthCheck(): Promise<boolean> {
    // Memory adapter is always healthy
    return true;
  }

  // Utility methods for testing
  clear(): void {
    this.users.clear();
    this.credits.clear();
    this.ledger.length = 0;
    this.dailyBonuses.clear();
  }

  getUserCount(): number {
    return this.users.size;
  }

  getCreditCount(): number {
    return this.credits.size;
  }

  getLedgerCount(): number {
    return this.ledger.length;
  }

  // Helper method to seed test data
  async seedTestData(): Promise<void> {
    const testAnonId = "test-anon-id-123";
    
    // Create test user
    await this.createUser(testAnonId);
    await this.updateUser(testAnonId, {
      name: "Test User",
      avatarUrl: "https://example.com/avatar.jpg"
    });

    // Create test credits
    await this.createCredits(testAnonId, 100);

    // Add some ledger entries
    await this.addCreditLedgerEntry({
      anonId: testAnonId,
      amount: 100,
      type: "initial" as CreditTransactionType,
      reason: "Initial credits"
    });

    await this.addCreditLedgerEntry({
      anonId: testAnonId,
      amount: 10,
      type: "daily_bonus" as CreditTransactionType,
      reason: "Daily bonus"
    });

    await this.addCreditLedgerEntry({
      anonId: testAnonId,
      amount: -5,
      type: "spend" as CreditTransactionType,
      reason: "API usage"
    });
  }
}

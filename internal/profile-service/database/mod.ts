/**
 * Database Module
 * 
 * Exports database adapters and factory function for creating the appropriate adapter
 * based on configuration.
 */

export { MemoryDatabaseAdapter } from "./memory-adapter.ts";
export { PostgresDatabaseAdapter } from "./postgres-adapter.ts";

import type { DatabaseAdapter } from "../types.ts";
import { MemoryDatabaseAdapter } from "./memory-adapter.ts";
import { PostgresDatabaseAdapter } from "./postgres-adapter.ts";

/**
 * Creates a database adapter based on the provided configuration.
 * 
 * @param databaseUrl - Optional database connection string. If not provided, uses in-memory adapter.
 * @returns DatabaseAdapter instance
 */
export function createDatabaseAdapter(databaseUrl?: string): DatabaseAdapter {
  if (!databaseUrl) {
    console.log("🧠 Using in-memory database adapter (for testing/development)");
    return new MemoryDatabaseAdapter();
  }

  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    console.log("🐘 Using PostgreSQL database adapter");
    return new PostgresDatabaseAdapter(databaseUrl);
  }

  throw new Error(`Unsupported database URL: ${databaseUrl}`);
}

/**
 * Creates a test database adapter with optional seed data.
 * Always returns a MemoryDatabaseAdapter for consistent testing.
 * 
 * @param seedData - Whether to seed with test data
 * @returns MemoryDatabaseAdapter instance
 */
export async function createTestDatabaseAdapter(seedData = false): Promise<MemoryDatabaseAdapter> {
  const adapter = new MemoryDatabaseAdapter();
  
  if (seedData) {
    await adapter.seedTestData();
  }
  
  return adapter;
}

/**
 * Profile Service - Type Definitions
 * 
 * Core types for the profile service including user profiles, credits, and API responses.
 */

// Core domain types
export interface User {
  anonId: string;
  userId: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Credits {
  anonId: string;
  balance: number;
  updatedAt: Date;
}

export interface CreditLedgerEntry {
  id: string;
  anonId: string;
  amount: number;
  type: CreditTransactionType;
  reason: string | null;
  createdAt: Date;
}

export type CreditTransactionType = 
  | "daily_bonus"
  | "spend" 
  | "adjust"
  | "initial";

// API Request/Response types
export interface ProfileUpdateRequest {
  name?: string;
  avatarUrl?: string;
}

export interface UserInfoResponse {
  anonId: string;
  userId: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface CreditsResponse {
  balance: number;
  ledger: CreditLedgerEntryResponse[];
}

export interface CreditLedgerEntryResponse {
  id: string;
  amount: number;
  type: CreditTransactionType;
  reason: string | null;
  ts: string; // ISO8601
}

export interface DailyAwardRequest {
  // Empty body for now
}

export interface CreditAdjustRequest {
  amount: number;
  reason: string;
}

// Database interface types
export interface DatabaseAdapter {
  // User operations
  getUserByAnonId(anonId: string): Promise<User | null>;
  createUser(anonId: string): Promise<User>;
  updateUser(anonId: string, updates: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User>;
  
  // Credits operations
  getCredits(anonId: string): Promise<Credits | null>;
  createCredits(anonId: string, initialBalance?: number): Promise<Credits>;
  updateCreditsBalance(anonId: string, newBalance: number): Promise<Credits>;
  
  // Ledger operations
  getCreditLedger(anonId: string, limit?: number): Promise<CreditLedgerEntry[]>;
  addCreditLedgerEntry(entry: Omit<CreditLedgerEntry, 'id' | 'createdAt'>): Promise<CreditLedgerEntry>;
  
  // Daily bonus tracking
  getLastDailyBonus(anonId: string): Promise<Date | null>;
  
  // Health check
  healthCheck(): Promise<boolean>;
}

// Configuration types
export interface ProfileServiceConfig {
  port: number;
  databaseUrl?: string;
  corsOrigins: string[];
  cookieDomain: string;
  dailyBonusAmount: number;
  initialCreditsAmount: number;
}

// SDK types
export interface ProfileSDKConfig {
  profileServiceUrl: string;
  cookieName: string;
  cookieDomain: string;
  iframeTimeout: number;
}

export interface StorageMessage {
  type: 'get' | 'set' | 'backup';
  key: string;
  value?: string;
  requestId: string;
}

export interface StorageResponse {
  requestId: string;
  success: boolean;
  value?: string;
  error?: string;
}

// Error types
export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

export class ValidationError extends ProfileServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends ProfileServiceError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends ProfileServiceError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class RateLimitError extends ProfileServiceError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT', 429);
  }
}

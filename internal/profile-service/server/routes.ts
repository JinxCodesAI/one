/**
 * API Routes
 * 
 * HTTP route handlers for the profile service API endpoints.
 */


import type {
  DatabaseAdapter,
  ProfileServiceConfig,
  ProfileUpdateRequest,
  UserInfoResponse,
  CreditsResponse,
  DailyAwardRequest,
  CreditAdjustRequest
} from "../types.ts";
import {
  ValidationError,
  NotFoundError,
  RateLimitError
} from "../types.ts";
import {
  authMiddleware,
  validateJsonBody,
  createErrorResponse,
  RateLimiter,
  type RequestContext
} from "./middleware.ts";

export class ProfileServiceRoutes {
  private db: DatabaseAdapter;
  private config: ProfileServiceConfig;
  private dailyBonusLimiter: RateLimiter;

  constructor(db: DatabaseAdapter, config: ProfileServiceConfig) {
    this.db = db;
    this.config = config;
    // Rate limit daily bonus to once per hour per user
    this.dailyBonusLimiter = new RateLimiter(60 * 60 * 1000, 1);
  }

  /**
   * GET /api/userinfo - Get current user profile
   */
  async handleUserInfo(request: Request): Promise<Response> {
    try {
      const context = authMiddleware(request);
      const anonId = await this.getOrCreateAnonId(context);
      
      const user = await this.db.getUserByAnonId(anonId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      const response: UserInfoResponse = {
        anonId: user.anonId,
        userId: user.userId,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };

      return this.createJsonResponse(response);
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * GET /api/profile - Alias for userinfo
   */
  async handleGetProfile(request: Request): Promise<Response> {
    return this.handleUserInfo(request);
  }

  /**
   * POST /api/profile - Update user profile
   */
  async handleUpdateProfile(request: Request): Promise<Response> {
    try {
      const context = authMiddleware(request);
      const anonId = await this.getOrCreateAnonId(context);

      const updates = await validateJsonBody(request, this.isProfileUpdateRequest);
      
      // Validate updates
      if (updates.name !== undefined && typeof updates.name !== "string") {
        throw new ValidationError("Name must be a string");
      }
      if (updates.avatarUrl !== undefined && typeof updates.avatarUrl !== "string") {
        throw new ValidationError("Avatar URL must be a string");
      }

      const user = await this.db.updateUser(anonId, updates);

      const response: UserInfoResponse = {
        anonId: user.anonId,
        userId: user.userId,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };

      return this.createJsonResponse(response);
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * GET /api/credits - Get credits balance and ledger
   */
  async handleGetCredits(request: Request): Promise<Response> {
    try {
      const context = authMiddleware(request);
      const anonId = await this.getOrCreateAnonId(context);

      const credits = await this.db.getCredits(anonId);
      const ledger = await this.db.getCreditLedger(anonId);

      const response: CreditsResponse = {
        balance: credits?.balance || 0,
        ledger: ledger.map(entry => ({
          id: entry.id,
          amount: entry.amount,
          type: entry.type,
          reason: entry.reason,
          ts: entry.createdAt.toISOString()
        }))
      };

      return this.createJsonResponse(response);
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * POST /api/credits/daily-award - Award daily bonus
   */
  async handleDailyAward(request: Request): Promise<Response> {
    try {
      const context = authMiddleware(request);
      const anonId = await this.getOrCreateAnonId(context);

      // Rate limiting
      if (!this.dailyBonusLimiter.isAllowed(anonId)) {
        throw new RateLimitError("Daily bonus can only be claimed once per hour");
      }

      await validateJsonBody(request, this.isDailyAwardRequest);

      // Check if user already claimed today's bonus
      const lastBonus = await this.db.getLastDailyBonus(anonId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastBonus && lastBonus >= today) {
        throw new ValidationError("Daily bonus already claimed today");
      }

      // Get current credits or create if not exists
      let credits = await this.db.getCredits(anonId);
      if (!credits) {
        credits = await this.db.createCredits(anonId, 0);
      }

      // Add daily bonus
      const newBalance = credits.balance + this.config.dailyBonusAmount;
      await this.db.updateCreditsBalance(anonId, newBalance);

      // Add ledger entry
      await this.db.addCreditLedgerEntry({
        anonId,
        amount: this.config.dailyBonusAmount,
        type: "daily_bonus",
        reason: "Daily bonus"
      });

      // Update last bonus date (if memory adapter)
      if ('setLastDailyBonus' in this.db) {
        await (this.db as any).setLastDailyBonus(anonId, new Date());
      }

      const ledger = await this.db.getCreditLedger(anonId);

      const response: CreditsResponse = {
        balance: newBalance,
        ledger: ledger.map(entry => ({
          id: entry.id,
          amount: entry.amount,
          type: entry.type,
          reason: entry.reason,
          ts: entry.createdAt.toISOString()
        }))
      };

      return this.createJsonResponse(response);
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * POST /api/credits/adjust - Admin adjust credits
   */
  async handleCreditAdjust(request: Request): Promise<Response> {
    try {
      const context = authMiddleware(request);
      const anonId = await this.getOrCreateAnonId(context);

      const adjustment = await validateJsonBody(request, this.isCreditAdjustRequest);

      // Get current credits or create if not exists
      let credits = await this.db.getCredits(anonId);
      if (!credits) {
        credits = await this.db.createCredits(anonId, 0);
      }

      // Apply adjustment
      const newBalance = credits.balance + adjustment.amount;
      await this.db.updateCreditsBalance(anonId, newBalance);

      // Add ledger entry
      await this.db.addCreditLedgerEntry({
        anonId,
        amount: adjustment.amount,
        type: "adjust",
        reason: adjustment.reason
      });

      const ledger = await this.db.getCreditLedger(anonId);

      const response: CreditsResponse = {
        balance: newBalance,
        ledger: ledger.map(entry => ({
          id: entry.id,
          amount: entry.amount,
          type: entry.type,
          reason: entry.reason,
          ts: entry.createdAt.toISOString()
        }))
      };

      return this.createJsonResponse(response);
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * GET /api/healthz - Health check endpoint
   */
  async handleHealthCheck(): Promise<Response> {
    try {
      const isHealthy = await this.db.healthCheck();
      
      if (isHealthy) {
        return this.createJsonResponse({ status: "healthy" });
      } else {
        return this.createJsonResponse({ status: "unhealthy" }, 503);
      }
    } catch (error) {
      return this.createJsonResponse({ status: "unhealthy", error: error instanceof Error ? error.message : String(error) }, 503);
    }
  }

  // Private helper methods

  private async getOrCreateAnonId(context: RequestContext): Promise<string> {
    if (context.anonId) {
      // Ensure user exists in database
      let user = await this.db.getUserByAnonId(context.anonId);
      if (!user) {
        user = await this.db.createUser(context.anonId);
        // Create initial credits
        await this.db.createCredits(context.anonId, this.config.initialCreditsAmount);
        await this.db.addCreditLedgerEntry({
          anonId: context.anonId,
          amount: this.config.initialCreditsAmount,
          type: "initial",
          reason: "Initial credits"
        });
      }
      return context.anonId;
    }

    // Generate new anon ID
    const anonId = crypto.randomUUID();
    await this.db.createUser(anonId);
    await this.db.createCredits(anonId, this.config.initialCreditsAmount);
    await this.db.addCreditLedgerEntry({
      anonId,
      amount: this.config.initialCreditsAmount,
      type: "initial",
      reason: "Initial credits"
    });

    return anonId;
  }

  private createJsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  private handleError(error: Error): Response {
    if (error.name === "ValidationError") {
      return createErrorResponse(error, 400);
    }
    if (error.name === "NotFoundError") {
      return createErrorResponse(error, 404);
    }
    if (error.name === "RateLimitError") {
      return createErrorResponse(error, 429);
    }
    return createErrorResponse(error, 500);
  }

  // Type guards
  private isProfileUpdateRequest(data: unknown): data is ProfileUpdateRequest {
    return typeof data === "object" && data !== null;
  }

  private isDailyAwardRequest(data: unknown): data is DailyAwardRequest {
    return typeof data === "object" && data !== null;
  }

  private isCreditAdjustRequest(data: unknown): data is CreditAdjustRequest {
    return typeof data === "object" && data !== null &&
           typeof (data as any).amount === "number" &&
           typeof (data as any).reason === "string";
  }
}

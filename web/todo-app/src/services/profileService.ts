/**
 * Profile Service Integration
 * Handles user profiles, credits, and authentication
 *
 * Updated to use co-located BFF endpoints with proper anonId management.
 * The anonId is generated and managed client-side using the profile SDK,
 * then passed to the BFF via headers.
 */

import { getProfileClient } from "@one/profile-service";
import type { UserProfile, Credits } from "../types.ts";

class ProfileService {
  private baseUrl: string;
  private profileClient = getProfileClient();

  constructor() {
    this.baseUrl = '/api/profile';
  }

  /**
   * Get the anonId from the profile client SDK
   */
  private async getAnonId(): Promise<string> {
    return await this.profileClient.getAnonId();
  }

  /**
   * Make a request to the BFF Profile endpoints with anonId header
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const anonId = await this.getAnonId();

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Anon-Id': anonId,
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data;
  }

  /**
   * Get the current user's anonymous ID
   * This now uses the client SDK directly instead of the BFF endpoint
   */
  async getAnonIdPublic(): Promise<string> {
    try {
      return await this.getAnonId();
    } catch (error) {
      console.error("Error getting anonymous ID:", error);
      throw new Error("Failed to get user ID");
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const profile = await this.request<UserProfile>('/user-info');
      return {
        anonId: profile.anonId,
        userId: profile.userId,
        name: profile.name || undefined,
        avatarUrl: profile.avatarUrl || undefined,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw new Error("Failed to load user profile");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: { name?: string; avatarUrl?: string }): Promise<UserProfile> {
    try {
      const profile = await this.request<UserProfile>('/update-profile', {
        method: 'POST',
        body: JSON.stringify(updates),
      });
      return {
        anonId: profile.anonId,
        userId: profile.userId,
        name: profile.name || undefined,
        avatarUrl: profile.avatarUrl || undefined,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update profile");
    }
  }

  /**
   * Get user credits and transaction history
   */
  async getUserCredits(): Promise<Credits> {
    try {
      const credits = await this.request<Credits>('/credits');
      return {
        balance: credits.balance,
        ledger: credits.ledger.map((transaction: unknown) => {
          const t = transaction as Record<string, unknown>;
          return {
            id: t.id as string,
            amount: t.amount as number,
            type: t.type as 'daily_bonus' | 'spend' | 'earn' | 'adjustment',
            reason: (t.reason as string) || '',
            ts: t.ts as string
          };
        })
      };
    } catch (error) {
      console.error("Error getting user credits:", error);
      throw new Error("Failed to load credits");
    }
  }

  /**
   * Claim daily bonus credits
   */
  async claimDailyBonus(): Promise<Credits> {
    try {
      const credits = await this.request<Credits>('/claim-daily-bonus', {
        method: 'POST',
      });
      return {
        balance: credits.balance,
        ledger: credits.ledger.map((transaction: unknown) => {
          const t = transaction as Record<string, unknown>;
          return {
            id: t.id as string,
            amount: t.amount as number,
            type: t.type as 'daily_bonus' | 'spend' | 'earn' | 'adjustment',
            reason: (t.reason as string) || '',
            ts: t.ts as string
          };
        })
      };
    } catch (error) {
      console.error("Error claiming daily bonus:", error);

      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        throw new Error("Daily bonus already claimed today. Try again tomorrow!");
      }

      throw new Error("Failed to claim daily bonus");
    }
  }

  /**
   * Spend credits for AI operations
   */
  async spendCredits(amount: number, reason: string): Promise<Credits> {
    try {
      // Validate input
      if (amount <= 0) {
        throw new Error("Amount must be positive");
      }

      if (!reason || reason.trim().length === 0) {
        throw new Error("Reason is required");
      }

      // Use the BFF endpoint to spend credits
      const result = await this.request<Credits>('/spend-credits', {
        method: 'POST',
        body: JSON.stringify({
          amount: Math.abs(amount),
          reason
        }),
      });

      return {
        balance: result.balance,
        ledger: result.ledger.map((transaction: unknown) => {
          const t = transaction as Record<string, unknown>;
          return {
            id: t.id as string,
            amount: t.amount as number,
            type: t.type as 'daily_bonus' | 'spend' | 'earn' | 'adjustment',
            reason: (t.reason as string) || '',
            ts: t.ts as string
          };
        })
      };
    } catch (error) {
      console.error("Error spending credits:", error);

      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Re-throw validation errors as-is
      if (errorMessage === "Amount must be positive" || errorMessage === "Reason is required") {
        throw error;
      }

      if (errorMessage.includes("insufficient") || errorMessage.includes("balance")) {
        throw new Error("Insufficient credits");
      }

      if (errorMessage.includes("400")) {
        throw new Error("Invalid request");
      }

      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        throw new Error("Authentication failed");
      }

      if (errorMessage.includes("429")) {
        throw new Error("Rate limit exceeded");
      }

      if (errorMessage.includes("500") || errorMessage.includes("502") || errorMessage.includes("503")) {
        throw new Error("Service temporarily unavailable");
      }

      throw new Error("Failed to spend credits");
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();

// Export class for testing
export { ProfileService };

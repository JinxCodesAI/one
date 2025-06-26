/**
 * Profile Service Integration
 * Handles user profiles, credits, and authentication
 */

import {
  createProfileClient
} from "@one/profile-service";
import type { UserProfile, Credits } from "../types.ts";

class ProfileService {
  private client: ReturnType<typeof createProfileClient>;

  constructor() {
    // Get profile service URL from environment or use default
    const profileServiceUrl = this.getProfileServiceUrl();

    console.log("Profile Service URL:", profileServiceUrl); // Debug log

    this.client = createProfileClient({
      profileServiceUrl,
      cookieDomain: this.getCookieDomain(),
      iframeTimeout: 5000
    });
  }

  private getProfileServiceUrl(): string {
    // Check for Vite environment variable first
    if (typeof window !== "undefined") {
      // @ts-ignore - Vite injects these at build time
      return import.meta.env?.VITE_PROFILE_API_URL || "http://localhost:8080";
    }
    
    // Fallback for server-side or testing
    return Deno?.env?.get("PROFILE_API_URL") || "http://localhost:8080";
  }

  private getCookieDomain(): string {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      
      // For localhost development
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "localhost";
      }
      
      // For production, extract the domain
      const parts = hostname.split(".");
      if (parts.length > 2) {
        return "." + parts.slice(-2).join(".");
      }
      
      return hostname;
    }
    
    return ".jinxcodes.ai"; // Default for production
  }

  /**
   * Get the current user's anonymous ID
   */
  async getAnonId(): Promise<string> {
    try {
      return await this.client.getAnonId();
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
      const profile = await this.client.getUserInfo();
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
      const profile = await this.client.updateProfile(updates);
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
      const credits = await this.client.getCredits();
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
      const credits = await this.client.claimDailyBonus();
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
      // Use the adjust credits endpoint to spend credits
      const response = await fetch(`${this.getProfileServiceUrl()}/api/credits/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Anon-Id': await this.getAnonId()
        },
        body: JSON.stringify({
          amount: -Math.abs(amount), // Ensure negative for spending
          reason
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to spend credits");
      }

      return {
        balance: result.data.balance,
        ledger: result.data.ledger.map((transaction: unknown) => {
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
      throw new Error("Failed to spend credits");
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();

// Export class for testing
export { ProfileService };

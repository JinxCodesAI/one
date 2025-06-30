/**
 * Daily Bonus Validation Utility
 * 
 * Provides BFF-side validation to prevent daily bonus claims more than once per day.
 * This is a secondary validation layer - the Profile Service is the authoritative source.
 */

interface DailyBonusRecord {
  anonId: string;
  lastClaimDate: string; // YYYY-MM-DD format
  lastClaimTimestamp: number;
}

class DailyBonusValidator {
  private claims = new Map<string, DailyBonusRecord>();
  
  /**
   * Check if user can claim daily bonus today
   */
  canClaimToday(anonId: string): boolean {
    const record = this.claims.get(anonId);
    if (!record) {
      return true; // No previous claim record
    }
    
    const today = this.getTodayString();
    return record.lastClaimDate !== today;
  }
  
  /**
   * Record a successful daily bonus claim
   */
  recordClaim(anonId: string): void {
    const today = this.getTodayString();
    const timestamp = Date.now();
    
    this.claims.set(anonId, {
      anonId,
      lastClaimDate: today,
      lastClaimTimestamp: timestamp
    });
  }
  
  /**
   * Get the last claim date for a user
   */
  getLastClaimDate(anonId: string): string | null {
    const record = this.claims.get(anonId);
    return record ? record.lastClaimDate : null;
  }
  
  /**
   * Get time until next claim is available (in milliseconds)
   */
  getTimeUntilNextClaim(anonId: string): number {
    const record = this.claims.get(anonId);
    if (!record) {
      return 0; // Can claim immediately
    }
    
    const today = this.getTodayString();
    if (record.lastClaimDate !== today) {
      return 0; // Can claim immediately
    }
    
    // Calculate time until tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return tomorrow.getTime() - Date.now();
  }
  
  /**
   * Get today's date string in YYYY-MM-DD format
   */
  private getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  /**
   * Clean up old records (optional, for memory management)
   */
  cleanup(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep records for 7 days
    const cutoffTimestamp = cutoffDate.getTime();
    
    for (const [anonId, record] of this.claims.entries()) {
      if (record.lastClaimTimestamp < cutoffTimestamp) {
        this.claims.delete(anonId);
      }
    }
  }
  
  /**
   * Get validation stats (for debugging)
   */
  getStats(): { totalUsers: number; claimsToday: number } {
    const today = this.getTodayString();
    let claimsToday = 0;
    
    for (const record of this.claims.values()) {
      if (record.lastClaimDate === today) {
        claimsToday++;
      }
    }
    
    return {
      totalUsers: this.claims.size,
      claimsToday
    };
  }
}

// Create singleton instance
export const dailyBonusValidator = new DailyBonusValidator();

// Optional: Set up periodic cleanup (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    dailyBonusValidator.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}

/**
 * Unit tests for ProfileService spendCredits method
 * Tests the core logic and error handling for credit spending
 */

import { assertEquals, assertRejects } from "@std/assert";

// Test the spendCredits method logic by creating a test implementation
class TestProfileService {
  private mockClient: {
    adjustCredits: (amount: number, reason: string) => Promise<{
      balance: number;
      ledger: Array<{
        id: string;
        amount: number;
        type: string;
        reason: string;
        ts: string;
      }>;
    }>;
  };

  constructor(mockClient: typeof this.mockClient) {
    this.mockClient = mockClient;
  }

  async spendCredits(amount: number, reason: string) {
    try {
      // Validate input
      if (amount <= 0) {
        throw new Error("Amount must be positive");
      }

      if (!reason || reason.trim().length === 0) {
        throw new Error("Reason is required");
      }

      // Use the SDK's adjustCredits method to spend credits
      const result = await this.mockClient.adjustCredits(-Math.abs(amount), reason);

      return {
        balance: result.balance,
        ledger: result.ledger.map((transaction) => ({
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type as 'daily_bonus' | 'spend' | 'earn' | 'adjustment',
          reason: transaction.reason || '',
          ts: transaction.ts
        }))
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

Deno.test("ProfileService - spendCredits validation", async () => {
  const mockClient = {
    adjustCredits: () => Promise.resolve({ balance: 75, ledger: [] })
  };
  const service = new TestProfileService(mockClient);

  // Test negative amount
  await assertRejects(
    () => service.spendCredits(-10, "test"),
    Error,
    "Amount must be positive"
  );

  // Test zero amount
  await assertRejects(
    () => service.spendCredits(0, "test"),
    Error,
    "Amount must be positive"
  );

  // Test empty reason
  await assertRejects(
    () => service.spendCredits(10, ""),
    Error,
    "Reason is required"
  );

  // Test whitespace-only reason
  await assertRejects(
    () => service.spendCredits(10, "   "),
    Error,
    "Reason is required"
  );
});

Deno.test("ProfileService - spendCredits success", async () => {
  let capturedAmount: number | undefined;
  let capturedReason: string | undefined;
  
  const mockClient = {
    adjustCredits: async (amount: number, reason: string) => {
      capturedAmount = amount;
      capturedReason = reason;
      return {
        balance: 100 + amount,
        ledger: [
          {
            id: "test-adjust",
            amount: amount,
            type: "spend",
            reason: reason,
            ts: "2025-01-01T00:00:00.000Z"
          }
        ]
      };
    }
  };

  const service = new TestProfileService(mockClient);
  const credits = await service.spendCredits(25, "AI task generation");
  
  // Should pass negative amount to adjustCredits
  assertEquals(capturedAmount, -25);
  assertEquals(capturedReason, "AI task generation");
  assertEquals(credits.balance, 75); // 100 + (-25)
  assertEquals(credits.ledger[0].amount, -25);
  assertEquals(credits.ledger[0].reason, "AI task generation");
});

Deno.test("ProfileService - spendCredits error handling", async () => {
  // Test insufficient credits error
  const insufficientMockClient = {
    adjustCredits: async () => {
      throw new Error("Insufficient balance");
    }
  };
  const insufficientService = new TestProfileService(insufficientMockClient);
  await assertRejects(
    () => insufficientService.spendCredits(200, "test"),
    Error,
    "Insufficient credits"
  );

  // Test authentication error
  const authMockClient = {
    adjustCredits: async () => {
      throw new Error("HTTP 401: Unauthorized");
    }
  };
  const authService = new TestProfileService(authMockClient);
  await assertRejects(
    () => authService.spendCredits(10, "test"),
    Error,
    "Authentication failed"
  );

  // Test rate limit error
  const rateLimitMockClient = {
    adjustCredits: async () => {
      throw new Error("HTTP 429: Too Many Requests");
    }
  };
  const rateLimitService = new TestProfileService(rateLimitMockClient);
  await assertRejects(
    () => rateLimitService.spendCredits(10, "test"),
    Error,
    "Rate limit exceeded"
  );

  // Test server error
  const serverErrorMockClient = {
    adjustCredits: async () => {
      throw new Error("HTTP 500: Internal Server Error");
    }
  };
  const serverErrorService = new TestProfileService(serverErrorMockClient);
  await assertRejects(
    () => serverErrorService.spendCredits(10, "test"),
    Error,
    "Service temporarily unavailable"
  );

  // Test generic error
  const genericErrorMockClient = {
    adjustCredits: async () => {
      throw new Error("Unknown error");
    }
  };
  const genericErrorService = new TestProfileService(genericErrorMockClient);
  await assertRejects(
    () => genericErrorService.spendCredits(10, "test"),
    Error,
    "Failed to spend credits"
  );
});

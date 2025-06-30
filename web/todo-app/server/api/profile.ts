/**
 * Profile Service API Route Handlers
 *
 * Handles all profile-related endpoints for the Todo App BFF server.
 * These routes proxy requests to the internal Profile service using direct HTTP calls.
 *
 * NOTE: We do NOT use the profile SDK here because:
 * - The SDK is client-side only (requires browser APIs like document.cookie, iframe)
 * - The BFF should make direct HTTP calls to the profile service API
 * - The frontend handles anonId generation and passes it to the BFF
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { createServerProfileClient } from '../utils/profileServiceClient.ts';
import { dailyBonusValidator } from '../utils/dailyBonusValidator.ts';

// Configuration
const PROFILE_SERVICE_PORT = parseInt(Deno.env.get("PROFILE_SERVICE_PORT") || "8081", 10);
const PROFILE_SERVICE_HOST = Deno.env.get("PROFILE_SERVICE_HOST") || "localhost";
const INTERNAL_PROFILE_API_URL = `http://${PROFILE_SERVICE_HOST}:${PROFILE_SERVICE_PORT}`;

// Create server-side profile client
const profileClient = createServerProfileClient({
  baseUrl: INTERNAL_PROFILE_API_URL,
  timeout: 10000
});

// Create Profile routes
export const profileRoutes = new Hono();

/**
 * Helper function to make authenticated requests to the profile service
 */
async function callProfileService(
  method: 'GET' | 'POST',
  path: string,
  anonId: string,
  body?: unknown
): Promise<Response> {
  const url = `${INTERNAL_PROFILE_API_URL}/api${path}`;

  const headers: Record<string, string> = {
    'X-Anon-Id': anonId,
    'Content-Type': 'application/json'
  };

  console.log(`[PROFILE-API] Calling ${method} ${url} with anonId ${anonId}`);

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  return response;
}

/**
 * Extract anonId from request headers or body
 */
function extractAnonId(c: Context): string | null {
  // Try to get from X-Anon-Id header first
  const headerAnonId = c.req.header('X-Anon-Id');
  if (headerAnonId) {
    return headerAnonId;
  }

  // Try to get from Authorization header (if using Bearer token format)
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Get anonymous ID for the user
 * GET /api/profile/anon-id
 *
 * NOTE: This endpoint is deprecated. The frontend should generate and manage
 * the anonId using the profile service client SDK, then pass it to other endpoints.
 */
profileRoutes.get('/anon-id', (c: Context) => {
  return c.json({
    error: 'This endpoint is deprecated. Use the profile service client SDK in the frontend to generate and manage anonId.',
    details: 'The anonId should be generated client-side and passed to other API endpoints via headers.'
  }, 410); // 410 Gone - resource no longer available
});

/**
 * Get user profile information
 * GET /api/profile/user-info
 * Requires X-Anon-Id header
 */
profileRoutes.get('/user-info', async (c: Context) => {
  try {
    const anonId = extractAnonId(c);
    if (!anonId) {
      return c.json({
        error: 'Missing anonId',
        details: 'X-Anon-Id header is required'
      }, 400);
    }

    const userInfo = await profileClient.getUserInfo(anonId);

    return c.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return c.json({
      error: 'Failed to load user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Update user profile
 * POST /api/profile/update-profile
 * Requires X-Anon-Id header
 */
profileRoutes.post('/update-profile', async (c: Context) => {
  try {
    const anonId = extractAnonId(c);
    if (!anonId) {
      return c.json({
        error: 'Missing anonId',
        details: 'X-Anon-Id header is required'
      }, 400);
    }

    let body;
    try {
      body = await c.req.json();
    } catch (jsonError) {
      return c.json({
        error: 'Invalid JSON in request body',
        details: jsonError instanceof Error ? jsonError.message : 'Invalid JSON format'
      }, 400);
    }

    const updates: { name?: string; avatarUrl?: string } = {};
    if (body.name && typeof body.name === 'string') {
      updates.name = body.name;
    }
    if (body.avatarUrl && typeof body.avatarUrl === 'string') {
      updates.avatarUrl = body.avatarUrl;
    }

    const userInfo = await profileClient.updateProfile(anonId, updates);

    return c.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return c.json({
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get user credits and transaction history
 * GET /api/profile/credits
 * Requires X-Anon-Id header
 */
profileRoutes.get('/credits', async (c: Context) => {
  try {
    const anonId = extractAnonId(c);
    if (!anonId) {
      return c.json({
        error: 'Missing anonId',
        details: 'X-Anon-Id header is required'
      }, 400);
    }

    const credits = await profileClient.getCredits(anonId);

    return c.json({
      success: true,
      data: credits
    });
  } catch (error) {
    console.error("Error getting user credits:", error);
    return c.json({
      error: 'Failed to load credits',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Claim daily bonus credits
 * POST /api/profile/claim-daily-bonus
 * Requires X-Anon-Id header
 */
profileRoutes.post('/claim-daily-bonus', async (c: Context) => {
  try {
    const anonId = extractAnonId(c);
    if (!anonId) {
      return c.json({
        error: 'Missing anonId',
        details: 'X-Anon-Id header is required'
      }, 400);
    }

    // This endpoint doesn't require body validation in the BFF
    // The Profile Service will handle the request body validation

    // BFF-side validation: Check if user can claim today
    if (!dailyBonusValidator.canClaimToday(anonId)) {
      const timeUntilNext = dailyBonusValidator.getTimeUntilNextClaim(anonId);
      const hoursUntilNext = Math.ceil(timeUntilNext / (1000 * 60 * 60));

      return c.json({
        error: 'Daily bonus already claimed today. Try again tomorrow!',
        details: `You can claim your next daily bonus in approximately ${hoursUntilNext} hours.`,
        timeUntilNextClaim: timeUntilNext
      }, 429);
    }

    const credits = await profileClient.claimDailyBonus(anonId);

    // Record successful claim in BFF validator
    dailyBonusValidator.recordClaim(anonId);

    return c.json({
      success: true,
      data: credits
    });
  } catch (error) {
    console.error("Error claiming daily bonus:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes('429')) {
      return c.json({
        error: 'Daily bonus already claimed today. Try again tomorrow!',
        details: error.message
      }, 429);
    }

    return c.json({
      error: 'Failed to claim daily bonus',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Spend credits for AI operations
 * POST /api/profile/spend-credits
 * Requires X-Anon-Id header
 */
profileRoutes.post('/spend-credits', async (c: Context) => {
  try {
    const anonId = extractAnonId(c);
    if (!anonId) {
      return c.json({
        error: 'Missing anonId',
        details: 'X-Anon-Id header is required'
      }, 400);
    }

    const body = await c.req.json();

    const amount = body.amount;
    const reason = body.reason;

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return c.json({ error: 'Amount must be a positive number' }, 400);
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return c.json({ error: 'Reason is required' }, 400);
    }

    // Use the profile service's adjustCredits endpoint to spend credits
    const response = await callProfileService('POST', '/credits/adjust', anonId, {
      amount: -Math.abs(amount),
      reason
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}`;

      if (response.status === 400) {
        if (errorMessage.includes("insufficient") || errorMessage.includes("balance")) {
          return c.json({
            error: 'Insufficient credits',
            details: errorMessage
          }, 400);
        }
        return c.json({
          error: 'Invalid request',
          details: errorMessage
        }, 400);
      }

      if (response.status === 401 || response.status === 403) {
        return c.json({
          error: 'Authentication failed',
          details: errorMessage
        }, 401);
      }

      if (response.status === 429) {
        return c.json({
          error: 'Rate limit exceeded',
          details: errorMessage
        }, 429);
      }

      if (response.status >= 500) {
        return c.json({
          error: 'Service temporarily unavailable',
          details: errorMessage
        }, 503);
      }

      return c.json({
        error: 'Failed to spend credits',
        details: errorMessage
      }, 500);
    }

    const result = await response.json();
    return c.json({
      success: true,
      data: {
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
      }
    });
  } catch (error) {
    console.error("Error spending credits:", error);
    return c.json({
      error: 'Failed to spend credits',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

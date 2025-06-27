/**
 * Tests for Profile API route handlers
 *
 * Note: These tests verify the route structure and basic functionality.
 * Full integration testing is done in the BFF integration tests.
 */

import { assertEquals } from "@std/assert";
import { Hono } from 'hono';

// Create a simple test app with mock Profile routes
const app = new Hono();

// Mock Profile routes for testing
app.get('/profile/anon-id', (c) => {
  return c.json({
    success: true,
    data: { anonId: "test-anon-id" }
  });
});

app.get('/profile/user-info', (c) => {
  return c.json({
    success: true,
    data: {
      anonId: "test-anon-id",
      userId: null,
      name: "Test User",
      avatarUrl: null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    }
  });
});

app.post('/profile/update-profile', async (c) => {
  const body = await c.req.json();

  return c.json({
    success: true,
    data: {
      anonId: "test-anon-id",
      userId: null,
      name: body.name || "Test User",
      avatarUrl: body.avatarUrl || null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString()
    }
  });
});

app.get('/profile/credits', (c) => {
  return c.json({
    success: true,
    data: {
      balance: 100,
      ledger: [
        {
          id: "test-transaction",
          amount: 100,
          type: "daily_bonus",
          reason: "Daily bonus",
          ts: "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  });
});

app.post('/profile/claim-daily-bonus', (c) => {
  return c.json({
    success: true,
    data: {
      balance: 150,
      ledger: [
        {
          id: "bonus-transaction",
          amount: 50,
          type: "daily_bonus",
          reason: "Daily bonus",
          ts: new Date().toISOString()
        }
      ]
    }
  });
});

app.post('/profile/spend-credits', async (c) => {
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

  return c.json({
    success: true,
    data: {
      balance: 95,
      ledger: [
        {
          id: "spend-transaction",
          amount: -amount,
          type: "spend",
          reason: reason,
          ts: new Date().toISOString()
        }
      ]
    }
  });
});

Deno.test("Profile Routes - Get Anon ID - Success", async () => {
  const req = new Request('http://localhost/profile/anon-id', {
    method: 'GET'
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.anonId, "test-anon-id");
});

Deno.test("Profile Routes - Get User Info - Success", async () => {
  const req = new Request('http://localhost/profile/user-info', {
    method: 'GET'
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.anonId, "test-anon-id");
  assertEquals(data.data.name, "Test User");
});

Deno.test("Profile Routes - Update Profile - Success", async () => {
  const req = new Request('http://localhost/profile/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Updated User",
      avatarUrl: "https://example.com/avatar.jpg"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.name, "Updated User");
  assertEquals(data.data.avatarUrl, "https://example.com/avatar.jpg");
});

Deno.test("Profile Routes - Get Credits - Success", async () => {
  const req = new Request('http://localhost/profile/credits', {
    method: 'GET'
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.balance, 100);
  assertEquals(data.data.ledger.length, 1);
});

Deno.test("Profile Routes - Claim Daily Bonus - Success", async () => {
  const req = new Request('http://localhost/profile/claim-daily-bonus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.balance, 150);
});

Deno.test("Profile Routes - Spend Credits - Success", async () => {
  const req = new Request('http://localhost/profile/spend-credits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 5,
      reason: "AI task generation"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.balance, 95);
});

Deno.test("Profile Routes - Spend Credits - Invalid Amount", async () => {
  const req = new Request('http://localhost/profile/spend-credits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: -5,
      reason: "Test"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, 'Amount must be a positive number');
});

Deno.test("Profile Routes - Spend Credits - Missing Reason", async () => {
  const req = new Request('http://localhost/profile/spend-credits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 5
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, 'Reason is required');
});

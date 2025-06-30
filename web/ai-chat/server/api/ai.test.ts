/**
 * Tests for AI API route handlers
 *
 * Note: These tests verify the route structure and basic functionality.
 * Full integration testing is done in the BFF integration tests.
 */

import { assertEquals, assertExists } from "@std/assert";
import { Hono } from 'hono';

// Create a simple test app with mock AI routes
const app = new Hono();

// Mock AI routes for testing
app.post('/ai/generate', async (c) => {
  const body = await c.req.json();

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: 'Invalid request: messages array is required' }, 400);
  }

  // Validate message format
  for (const message of body.messages) {
    if (!message.role || !message.content) {
      return c.json({ error: 'Invalid message format: role and content are required' }, 400);
    }
  }

  return c.json({
    success: true,
    data: {
      content: "This is a test AI response",
      model: body.model || "gpt-4.1-nano",
      usage: {
        promptTokens: 10,
        completionTokens: 8,
        totalTokens: 18
      }
    }
  });
});

app.post('/ai/generate-object', async (c) => {
  const body = await c.req.json();

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: 'Invalid request: messages array is required' }, 400);
  }

  if (!body.schema) {
    return c.json({ error: 'Invalid request: schema is required for structured generation' }, 400);
  }

  return c.json({
    success: true,
    data: {
      object: { test: "structured response" },
      model: body.model || "gpt-4.1-nano"
    }
  });
});

app.get('/ai/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      models: ["gpt-4.1-nano", "gemini-2.5-flash"]
    }
  });
});

app.get('/ai/models', (c) => {
  return c.json({
    success: true,
    data: { models: ["gpt-4.1-nano", "gemini-2.5-flash", "claude-3-sonnet"] }
  });
});

Deno.test("AI Routes - Generate Text - Success", async () => {
  const req = new Request('http://localhost/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "Hello, how are you?" }
      ],
      model: "gpt-4.1-nano"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.content, "This is a test AI response");
  assertEquals(data.data.model, "gpt-4.1-nano");
  assertExists(data.data.usage);
});

Deno.test("AI Routes - Generate Text - Missing Messages", async () => {
  const req = new Request('http://localhost/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gpt-4.1-nano"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, 'Invalid request: messages array is required');
});

Deno.test("AI Routes - Generate Text - Invalid Message Format", async () => {
  const req = new Request('http://localhost/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: "user" } // missing content
      ]
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, 'Invalid message format: role and content are required');
});

Deno.test("AI Routes - Generate Object - Success", async () => {
  const req = new Request('http://localhost/ai/generate-object', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "Generate a test object" }
      ],
      schema: {
        type: "object",
        properties: {
          test: { type: "string" }
        }
      }
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.object.test, "structured response");
});

Deno.test("AI Routes - Generate Object - Missing Schema", async () => {
  const req = new Request('http://localhost/ai/generate-object', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "Generate a test object" }
      ]
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, 'Invalid request: schema is required for structured generation');
});

Deno.test("AI Routes - Health Check - Success", async () => {
  const req = new Request('http://localhost/ai/health', {
    method: 'GET'
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.status, "healthy");
  assertEquals(data.data.models.length, 2);
});

Deno.test("AI Routes - Get Models - Success", async () => {
  const req = new Request('http://localhost/ai/models', {
    method: 'GET'
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.models.length, 3);
  assertEquals(data.data.models[0], "gpt-4.1-nano");
});

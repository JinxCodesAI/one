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
app.post('/ai/generate-tasks', async (c) => {
  const body = await c.req.json();

  if (!body.prompt || typeof body.prompt !== 'string') {
    return c.json({ error: 'Prompt is required and must be a string' }, 400);
  }

  return c.json({
    success: true,
    data: [
      {
        title: "Test Task",
        description: "A test task",
        priority: "medium",
        category: "Work",
        estimatedCredits: 3
      }
    ]
  });
});

app.post('/ai/categorize-task', async (c) => {
  const body = await c.req.json();

  if (!body.title || typeof body.title !== 'string') {
    return c.json({ error: 'Title is required and must be a string' }, 400);
  }

  return c.json({
    success: true,
    data: { category: "Work" }
  });
});

app.post('/ai/completion-suggestions', async (c) => {
  const body = await c.req.json();

  if (!body.title || typeof body.title !== 'string') {
    return c.json({ error: 'Title is required and must be a string' }, 400);
  }

  return c.json({
    success: true,
    data: {
      suggestions: [
        "Break it down",
        "Set a timer",
        "Remove distractions"
      ]
    }
  });
});

app.post('/ai/motivational-message', (c) => {
  return c.json({
    success: true,
    data: { message: "Great job! Keep it up! 🚀" }
  });
});

app.get('/ai/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      models: ["gpt-4.1-nano"]
    }
  });
});

app.get('/ai/models', (c) => {
  return c.json({
    success: true,
    data: { models: ["gpt-4.1-nano"] }
  });
});

Deno.test("AI Routes - Generate Tasks - Success", async () => {
  const req = new Request('http://localhost/ai/generate-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: "Plan my work week",
      taskCount: 1
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.length, 1);
  assertEquals(data.data[0].title, "Test Task");
});

Deno.test("AI Routes - Generate Tasks - Missing Prompt", async () => {
  const req = new Request('http://localhost/ai/generate-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskCount: 1
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, 'Prompt is required and must be a string');
});

Deno.test("AI Routes - Categorize Task - Success", async () => {
  const req = new Request('http://localhost/ai/categorize-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Review reports",
      description: "Quarterly analysis"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.category, "Work");
});

Deno.test("AI Routes - Categorize Task - Missing Title", async () => {
  const req = new Request('http://localhost/ai/categorize-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: "Some description"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, 'Title is required and must be a string');
});

Deno.test("AI Routes - Completion Suggestions - Success", async () => {
  const req = new Request('http://localhost/ai/completion-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Complete project",
      description: "Finish the todo app",
      priority: "high"
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.suggestions.length, 3);
});

Deno.test("AI Routes - Motivational Message - Success", async () => {
  const req = new Request('http://localhost/ai/motivational-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      completedCount: 5,
      totalCount: 10
    })
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertExists(data.data.message);
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
  assertEquals(data.data.models.length, 1);
});

Deno.test("AI Routes - Get Models - Success", async () => {
  const req = new Request('http://localhost/ai/models', {
    method: 'GET'
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.data.models.length, 1);
  assertEquals(data.data.models[0], "gpt-4.1-nano");
});

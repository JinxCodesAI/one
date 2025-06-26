/**
 * Tests for SDK client
 */

import { assertEquals, assertRejects } from "@std/assert";
import { AIClient, createClient, createSimpleClient } from "./client.ts";

Deno.test("createSimpleClient creates client with base URL", () => {
  const client = createSimpleClient("http://localhost:8000");
  assertEquals(client instanceof AIClient, true);
});

Deno.test("createSimpleClient creates client with default URL", () => {
  const client = createSimpleClient();
  assertEquals(client instanceof AIClient, true);
});

Deno.test("createClient creates client with full config", () => {
  const client = createClient({
    baseUrl: "http://localhost:8000",
    timeout: 5000,
  });
  assertEquals(client instanceof AIClient, true);
});

Deno.test("AIClient - generateText handles network error", async () => {
  const client = new AIClient({
    baseUrl: "http://nonexistent-server:9999",
    timeout: 1000,
  });

  await assertRejects(
    () =>
      client.generateText({
        messages: [{ role: "user", content: "Hello" }],
      }),
    Error,
    // Could be either network error or timeout
  );
});

Deno.test("AIClient - getModels handles network error", async () => {
  const client = new AIClient({
    baseUrl: "http://nonexistent-server:9999",
    timeout: 1000,
  });

  await assertRejects(
    () => client.getModels(),
    Error,
    // Could be either network error or timeout
  );
});

Deno.test("AIClient - getHealth handles network error", async () => {
  const client = new AIClient({
    baseUrl: "http://nonexistent-server:9999",
    timeout: 1000,
  });

  await assertRejects(
    () => client.getHealth(),
    Error,
    // Could be either network error or timeout
  );
});

// Mock fetch for testing successful responses
const originalFetch = globalThis.fetch;

function mockFetch(
  url: string | URL | Request,
  _init?: RequestInit,
): Promise<Response> {
  const urlStr = url.toString();

  if (urlStr.includes("/generate-object")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            object: {
              name: "John Doe",
              age: 30,
              occupation: "Software Engineer",
            },
            model: "gpt-4.1-nano",
            usage: {
              promptTokens: 25,
              completionTokens: 12,
              totalTokens: 37,
            },
          },
        }),
        { status: 200 },
      ),
    );
  }

  if (urlStr.includes("/generate")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            content: "Hello! How can I help you?",
            model: "gpt-4.1-nano",
            usage: {
              promptTokens: 10,
              completionTokens: 8,
              totalTokens: 18,
            },
          },
        }),
        { status: 200 },
      ),
    );
  }

  if (urlStr.includes("/models")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            models: ["gpt-4.1-nano", "gemini-2.5-flash"],
          },
        }),
        { status: 200 },
      ),
    );
  }

  if (urlStr.includes("/health")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            status: "healthy",
            timestamp: "2024-01-01T00:00:00.000Z",
            models: ["gpt-4.1-nano", "gemini-2.5-flash"],
            version: "0.0.1",
          },
        }),
        { status: 200 },
      ),
    );
  }

  return Promise.resolve(new Response("Not Found", { status: 404 }));
}

Deno.test("AIClient - generateText returns successful response", async () => {
  globalThis.fetch = mockFetch;

  const client = new AIClient({
    baseUrl: "http://localhost:8000",
  });

  const response = await client.generateText({
    messages: [{ role: "user", content: "Hello" }],
  });

  assertEquals(response.content, "Hello! How can I help you?");
  assertEquals(response.model, "gpt-4.1-nano");
  assertEquals(response.usage?.totalTokens, 18);

  globalThis.fetch = originalFetch;
});

Deno.test("AIClient - getModels returns model list", async () => {
  globalThis.fetch = mockFetch;

  const client = new AIClient({
    baseUrl: "http://localhost:8000",
  });

  const models = await client.getModels();

  assertEquals(models.length, 2);
  assertEquals(models.includes("gpt-4.1-nano"), true);
  assertEquals(models.includes("gemini-2.5-flash"), true);

  globalThis.fetch = originalFetch;
});

Deno.test("AIClient - getHealth returns health status", async () => {
  globalThis.fetch = mockFetch;

  const client = new AIClient({
    baseUrl: "http://localhost:8000",
  });

  const health = await client.getHealth();

  assertEquals(health.status, "healthy");
  assertEquals(health.models.length, 2);
  assertEquals(health.version, "0.0.1");

  globalThis.fetch = originalFetch;
});

Deno.test("AIClient - generateObject returns successful response", async () => {
  globalThis.fetch = mockFetch;

  const client = new AIClient({
    baseUrl: "http://localhost:8000",
  });

  interface PersonProfile extends Record<string, unknown> {
    name: string;
    age: number;
    occupation: string;
  }

  const response = await client.generateObject<PersonProfile>({
    messages: [{ role: "user", content: "Generate a person profile" }],
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
        occupation: { type: "string" },
      },
      required: ["name", "age", "occupation"],
    },
  });

  assertEquals(response.object.name, "John Doe");
  assertEquals(response.object.age, 30);
  assertEquals(response.object.occupation, "Software Engineer");
  assertEquals(response.model, "gpt-4.1-nano");
  assertEquals(response.usage?.totalTokens, 37);

  globalThis.fetch = originalFetch;
});

Deno.test("AIClient - generateObject handles network error", async () => {
  const client = new AIClient({
    baseUrl: "http://nonexistent-server:9999",
    timeout: 1000,
  });

  await assertRejects(
    () =>
      client.generateObject({
        messages: [{ role: "user", content: "Generate data" }],
        schema: { type: "object", properties: {} },
      }),
    Error,
    // Could be either network error or timeout
  );
});

// Test error responses
function mockErrorFetch(): Promise<Response> {
  return Promise.resolve(
    new Response(
      JSON.stringify({
        success: false,
        error: {
          error: "Test error message",
          code: "TEST_ERROR",
        },
      }),
      { status: 400 },
    ),
  );
}

Deno.test("AIClient - generateText handles API error", async () => {
  globalThis.fetch = mockErrorFetch;

  const client = new AIClient({
    baseUrl: "http://localhost:8000",
  });

  await assertRejects(
    () =>
      client.generateText({
        messages: [{ role: "user", content: "Hello" }],
      }),
    Error,
    "Test error message",
  );

  globalThis.fetch = originalFetch;
});

Deno.test("AIClient - generateObject handles API error", async () => {
  globalThis.fetch = mockErrorFetch;

  const client = new AIClient({
    baseUrl: "http://localhost:8000",
  });

  await assertRejects(
    () =>
      client.generateObject({
        messages: [{ role: "user", content: "Generate data" }],
        schema: { type: "object", properties: {} },
      }),
    Error,
    "Test error message",
  );

  globalThis.fetch = originalFetch;
});

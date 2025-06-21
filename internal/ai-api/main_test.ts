import { assertEquals, assertExists } from "@std/assert";
import { AIClient, createClient, createSimpleClient } from "./main.ts";

Deno.test("SDK exports are available", () => {
  // Test that main exports are available
  assertExists(AIClient);
  assertExists(createClient);
  assertExists(createSimpleClient);
});

Deno.test("createSimpleClient creates client instance", () => {
  const client = createSimpleClient("http://localhost:8000");
  assertExists(client);
  assertEquals(client instanceof AIClient, true);
});

Deno.test("createClient creates client instance with config", () => {
  const client = createClient({
    baseUrl: "http://localhost:8000",
    timeout: 5000,
  });
  assertExists(client);
  assertEquals(client instanceof AIClient, true);
});

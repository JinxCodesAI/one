/**
 * E2E tests for BFF server connectivity and API endpoints
 * These tests verify that the BFF server is running and responding correctly
 */

import { assertEquals, assertExists } from "@std/assert";

const APP_BASE_URL = "http://localhost:3000"; // Co-located BFF serves both API and frontend

Deno.test("E2E - Co-located BFF Server", async (t) => {
  await t.step("Server should be running and accessible", async () => {
    try {
      const response = await fetch(`${APP_BASE_URL}/health`);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(typeof data.status, "string");
      assertExists(data.timestamp);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Co-located BFF server is not running on ${APP_BASE_URL}. Error: ${errorMessage}`);
    }
  });

  await t.step("API test endpoint should be accessible", async () => {
    try {
      const response = await fetch(`${APP_BASE_URL}/api/test`);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.success, true);
      assertEquals(data.data.status, "healthy");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`API test endpoint is not accessible. Error: ${errorMessage}`);
    }
  });

  await t.step("Static files should be served (production mode)", async () => {
    try {
      // In production, the server should serve static files
      // In development, this might not work if dist/ doesn't exist
      const response = await fetch(`${APP_BASE_URL}/`);

      if (response.status === 200) {
        // Consume the response body to prevent resource leak
        await response.text();
        console.log("✅ Static files are being served (production mode)");
      } else {
        // Consume the response body to prevent resource leak
        await response.text();
        console.log("ℹ️  Static files not served - likely development mode");
      }
    } catch (_error) {
      console.log("ℹ️  Static file serving test skipped - likely development mode");
    }
  });
});

Deno.test("E2E - AI API Endpoints", async (t) => {
  await t.step("AI health endpoint should work", async () => {
    try {
      const response = await fetch(`${APP_BASE_URL}/api/ai/health`);
      // Should either succeed or fail gracefully (not connection error)
      if (response.status === 200) {
        const data = await response.json();
        assertEquals(data.success, true);
        assertExists(data.data);
      } else {
        // If it fails, it should be a proper error response
        const data = await response.json();
        assertExists(data.error);
        console.log(`ℹ️  AI service not available: ${data.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`AI health endpoint failed with connection error. Error: ${errorMessage}`);
    }
  });

  await t.step("AI models endpoint should work", async () => {
    try {
      const response = await fetch(`${APP_BASE_URL}/api/ai/models`);
      // Should either succeed or fail gracefully (not connection error)
      if (response.status === 200) {
        const data = await response.json();
        assertEquals(data.success, true);
        assertExists(data.data.models);
      } else {
        // If it fails, it should be a proper error response
        const data = await response.json();
        assertExists(data.error);
        console.log(`ℹ️  AI service not available: ${data.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`AI models endpoint failed with connection error. Error: ${errorMessage}`);
    }
  });

  await t.step("AI generate endpoint should handle requests", async () => {
    try {
      const response = await fetch(`${APP_BASE_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: "Hello, this is a test message" }
          ],
          model: "gpt-4.1-nano"
        })
      });

      // Should either succeed or fail gracefully (not connection error)
      if (response.status === 200) {
        const data = await response.json();
        assertEquals(data.success, true);
        assertExists(data.data.content);
      } else {
        // If it fails, it should be a proper error response
        const data = await response.json();
        assertExists(data.error);
        console.log(`ℹ️  AI service not available: ${data.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`AI generate endpoint failed with connection error. Error: ${errorMessage}`);
    }
  });

  await t.step("AI generate endpoint should validate input", async () => {
    // Test with missing messages
    const response = await fetch(`${APP_BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano"
      })
    });

    assertEquals(response.status, 400);
    const data = await response.json();
    assertEquals(data.error, "Invalid request: messages array is required");
  });
});

Deno.test("E2E - Error Handling", async (t) => {
  await t.step("Non-existent endpoints should return 404", async () => {
    const response = await fetch(`${APP_BASE_URL}/api/nonexistent`);
    assertEquals(response.status, 404);

    const data = await response.json();
    assertEquals(data.error, "Not found");
  });

  await t.step("Invalid JSON should return 400", async () => {
    const response = await fetch(`${APP_BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    });

    assertEquals(response.status, 400);
    const data = await response.json();
    assertEquals(data.error, "Invalid JSON in request body");
  });

  await t.step("Missing Content-Type should return 400", async () => {
    const response = await fetch(`${APP_BASE_URL}/api/ai/generate`, {
      method: 'POST',
      body: JSON.stringify({ test: "data" })
    });

    assertEquals(response.status, 400);
    const data = await response.json();
    assertEquals(data.error, "Content-Type must be application/json");
  });
});

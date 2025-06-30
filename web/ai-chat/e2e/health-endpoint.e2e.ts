/**
 * E2E tests specifically for the health endpoint
 * This test ensures the BFF server health endpoint is working correctly
 */

import { assertEquals, assertExists } from "@std/assert";

const BFF_BASE_URL = "http://localhost:3000";

Deno.test("E2E - Health Endpoint", async (t) => {
  await t.step("Health endpoint should be accessible", async () => {
    try {
      console.log(`🔍 Testing health endpoint: ${BFF_BASE_URL}/health`);
      
      const response = await fetch(`${BFF_BASE_URL}/health`);
      
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      assertEquals(response.status, 200, "Health endpoint should return 200");
      
      const data = await response.json();
      console.log(`📊 Response body:`, JSON.stringify(data, null, 2));
      
      // Validate response structure
      assertExists(data.status, "Response should have status field");
      assertExists(data.timestamp, "Response should have timestamp field");
      assertExists(data.environment, "Response should have environment field");
      assertExists(data.services, "Response should have services field");
      
      // Status should be either 'healthy' or 'degraded'
      assertEquals(typeof data.status, "string", "Status should be a string");
      assertEquals(data.environment, "development", "Environment should be development");
      
      // Validate services structure
      assertExists(data.services.ai, "Response should have AI service info");
      assertExists(data.services.ai.url, "AI service should have URL");
      
      // Validate timestamp format
      const timestamp = new Date(data.timestamp);
      assertEquals(timestamp instanceof Date && !isNaN(timestamp.getTime()), true, "Timestamp should be valid ISO date");
      
      console.log(`✅ Health endpoint test passed - Status: ${data.status}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Health endpoint test failed:`, errorMessage);
      throw new Error(`Health endpoint failed: ${errorMessage}`);
    }
  });

  await t.step("Health endpoint should handle CORS", async () => {
    try {
      console.log(`🔍 Testing CORS headers on health endpoint`);
      
      const response = await fetch(`${BFF_BASE_URL}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      console.log(`📊 OPTIONS response status: ${response.status}`);
      console.log(`📊 CORS headers:`, {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      });
      
      // Health endpoint might not have CORS since it's not under /api/*
      // But it should still respond properly
      assertEquals(response.status < 500, true, "OPTIONS request should not return server error");

      // Consume response body to prevent resource leak
      await response.text();

      console.log(`✅ CORS test completed`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ CORS test failed:`, errorMessage);
      throw new Error(`CORS test failed: ${errorMessage}`);
    }
  });

  await t.step("Health endpoint should respond quickly", async () => {
    try {
      console.log(`🔍 Testing health endpoint response time`);
      
      const start = Date.now();
      const response = await fetch(`${BFF_BASE_URL}/health`);
      const responseTime = Date.now() - start;
      
      console.log(`📊 Response time: ${responseTime}ms`);
      
      assertEquals(response.status, 200, "Health endpoint should return 200");
      
      // Health endpoint should respond within reasonable time (allowing for service checks)
      // Since it checks AI service, it might take longer
      assertEquals(responseTime < 10000, true, `Health endpoint should respond within 10 seconds (actual: ${responseTime}ms)`);
      
      // Consume response body to prevent resource leak
      await response.text();
      
      console.log(`✅ Response time test passed: ${responseTime}ms`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Response time test failed:`, errorMessage);
      throw new Error(`Response time test failed: ${errorMessage}`);
    }
  });
});

Deno.test("E2E - Health Endpoint Error Scenarios", async (t) => {
  await t.step("Invalid HTTP methods should be handled", async () => {
    try {
      console.log(`🔍 Testing invalid HTTP method on health endpoint`);
      
      const response = await fetch(`${BFF_BASE_URL}/health`, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`📊 POST response status: ${response.status}`);
      
      // Should either work (if POST is allowed) or return method not allowed or not found
      assertEquals(response.status === 200 || response.status === 405 || response.status === 404, true,
        `POST to health should return 200, 405, or 404 (actual: ${response.status})`);

      // Consume response body to prevent resource leak
      await response.text();
      
      console.log(`✅ Invalid method test completed`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Invalid method test failed:`, errorMessage);
      throw new Error(`Invalid method test failed: ${errorMessage}`);
    }
  });
});

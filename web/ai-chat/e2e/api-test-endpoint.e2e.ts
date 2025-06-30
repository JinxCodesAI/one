/**
 * E2E tests for the API test endpoint
 * This test ensures the basic API test endpoint is working correctly
 */

import { assertEquals, assertExists } from "@std/assert";

const BFF_BASE_URL = "http://localhost:3000";

Deno.test("E2E - API Test Endpoint", async (t) => {
  await t.step("API test endpoint should be accessible", async () => {
    try {
      console.log(`🔍 Testing API test endpoint: ${BFF_BASE_URL}/api/test`);
      
      const response = await fetch(`${BFF_BASE_URL}/api/test`);
      
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      assertEquals(response.status, 200, "API test endpoint should return 200");
      
      const data = await response.json();
      console.log(`📊 Response body:`, JSON.stringify(data, null, 2));
      
      // Validate response structure
      assertExists(data.success, "Response should have success field");
      assertExists(data.data, "Response should have data field");
      assertEquals(data.success, true, "Success should be true");
      assertEquals(data.data.status, "healthy", "Status should be healthy");
      
      console.log(`✅ API test endpoint working correctly`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ API test endpoint failed:`, errorMessage);
      throw new Error(`API test endpoint failed: ${errorMessage}`);
    }
  });

  await t.step("API test endpoint should handle CORS", async () => {
    try {
      console.log(`🔍 Testing CORS on API test endpoint`);
      
      const response = await fetch(`${BFF_BASE_URL}/api/test`, {
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
      
      // Should handle CORS properly
      assertEquals(response.status < 500, true, "OPTIONS request should not return server error");
      
      // Check for CORS headers
      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      if (allowOrigin) {
        console.log(`✅ CORS enabled with origin: ${allowOrigin}`);
      } else {
        console.log(`ℹ️  CORS headers not present - might be handled by middleware`);
      }

      // Consume response body to prevent resource leak
      await response.text();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ CORS test failed:`, errorMessage);
      throw new Error(`CORS test failed: ${errorMessage}`);
    }
  });

  await t.step("API test endpoint should respond quickly", async () => {
    try {
      console.log(`🔍 Testing API test endpoint response time`);
      
      const start = Date.now();
      const response = await fetch(`${BFF_BASE_URL}/api/test`);
      const responseTime = Date.now() - start;
      
      console.log(`📊 Response time: ${responseTime}ms`);
      
      assertEquals(response.status, 200, "API test endpoint should return 200");
      
      // Should respond very quickly since it's just a simple endpoint
      assertEquals(responseTime < 1000, true, `API test endpoint should respond within 1 second (actual: ${responseTime}ms)`);
      
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

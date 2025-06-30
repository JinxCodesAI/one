/**
 * E2E tests for the /api/test endpoint
 * This test ensures the API test endpoint works through both direct BFF and Vite proxy
 */

import { assertEquals, assertExists } from "@std/assert";

const BFF_BASE_URL = "http://localhost:3000";
const FRONTEND_BASE_URL = "http://localhost:5173";

Deno.test("E2E - API Test Endpoint", async (t) => {
  await t.step("API test endpoint should work via direct BFF", async () => {
    try {
      console.log(`🔍 Testing API test endpoint via BFF: ${BFF_BASE_URL}/api/test`);
      
      const response = await fetch(`${BFF_BASE_URL}/api/test`);
      
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      assertEquals(response.status, 200, "API test endpoint should return 200");
      
      const data = await response.json();
      console.log(`📊 Response body:`, JSON.stringify(data, null, 2));
      
      // Validate response structure
      assertExists(data.success, "Response should have success field");
      assertExists(data.data, "Response should have data field");
      assertExists(data.data.status, "Response data should have status field");
      
      assertEquals(data.success, true, "Success should be true");
      assertEquals(data.data.status, "healthy", "Status should be healthy");
      
      console.log(`✅ Direct BFF API test endpoint passed`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Direct BFF API test endpoint failed:`, errorMessage);
      throw new Error(`Direct BFF API test endpoint failed: ${errorMessage}`);
    }
  });

  await t.step("API test endpoint should work via Vite proxy", async () => {
    try {
      console.log(`🔍 Testing API test endpoint via Vite proxy: ${FRONTEND_BASE_URL}/api/test`);
      
      const response = await fetch(`${FRONTEND_BASE_URL}/api/test`);
      
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      assertEquals(response.status, 200, "API test endpoint should return 200 via proxy");
      
      const data = await response.json();
      console.log(`📊 Response body:`, JSON.stringify(data, null, 2));
      
      // Validate response structure
      assertExists(data.success, "Response should have success field");
      assertExists(data.data, "Response should have data field");
      assertExists(data.data.status, "Response data should have status field");
      
      assertEquals(data.success, true, "Success should be true");
      assertEquals(data.data.status, "healthy", "Status should be healthy");
      
      console.log(`✅ Vite proxy API test endpoint passed`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Vite proxy API test endpoint failed:`, errorMessage);
      
      // If Vite proxy fails, it might be because the frontend server isn't running
      if (errorMessage.includes("connection") || errorMessage.includes("refused")) {
        console.log(`ℹ️  This might be because the frontend dev server isn't running`);
        console.log(`   To start it: deno task dev:frontend`);
        throw new Error(`Vite proxy test failed - frontend server may not be running: ${errorMessage}`);
      }
      
      throw new Error(`Vite proxy API test endpoint failed: ${errorMessage}`);
    }
  });

  await t.step("Both endpoints should return identical responses", async () => {
    try {
      console.log(`🔍 Comparing responses from BFF and Vite proxy`);
      
      const [bffResponse, viteResponse] = await Promise.all([
        fetch(`${BFF_BASE_URL}/api/test`),
        fetch(`${FRONTEND_BASE_URL}/api/test`)
      ]);
      
      assertEquals(bffResponse.status, 200, "BFF response should be 200");
      assertEquals(viteResponse.status, 200, "Vite response should be 200");
      
      const [bffData, viteData] = await Promise.all([
        bffResponse.json(),
        viteResponse.json()
      ]);
      
      console.log(`📊 BFF response:`, JSON.stringify(bffData, null, 2));
      console.log(`📊 Vite response:`, JSON.stringify(viteData, null, 2));
      
      // Both should have the same structure and content
      assertEquals(bffData.success, viteData.success, "Success field should match");
      assertEquals(bffData.data.status, viteData.data.status, "Status field should match");
      
      console.log(`✅ Both endpoints return identical responses`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Response comparison failed:`, errorMessage);
      
      if (errorMessage.includes("connection") || errorMessage.includes("refused")) {
        console.log(`ℹ️  This might be because one of the servers isn't running`);
        console.log(`   BFF server: deno run -A server/index.ts`);
        console.log(`   Frontend server: deno task dev:frontend`);
      }
      
      throw new Error(`Response comparison failed: ${errorMessage}`);
    }
  });
});

Deno.test("E2E - API Test Endpoint Performance", async (t) => {
  await t.step("API test endpoint should respond quickly", async () => {
    try {
      console.log(`🔍 Testing API test endpoint response time`);
      
      const start = Date.now();
      const response = await fetch(`${BFF_BASE_URL}/api/test`);
      const responseTime = Date.now() - start;
      
      console.log(`📊 Response time: ${responseTime}ms`);
      
      assertEquals(response.status, 200, "API test endpoint should return 200");
      
      // API test endpoint should be very fast since it's just returning static data
      assertEquals(responseTime < 1000, true, `API test endpoint should respond within 1 second (actual: ${responseTime}ms)`);
      
      // Consume response body to prevent resource leak
      await response.text();
      
      console.log(`✅ Performance test passed: ${responseTime}ms`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Performance test failed:`, errorMessage);
      throw new Error(`Performance test failed: ${errorMessage}`);
    }
  });

  await t.step("API test endpoint should handle concurrent requests", async () => {
    try {
      console.log(`🔍 Testing concurrent requests to API test endpoint`);
      
      const start = Date.now();
      const promises = Array.from({ length: 5 }, () => 
        fetch(`${BFF_BASE_URL}/api/test`)
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - start;
      
      console.log(`📊 Total time for 5 concurrent requests: ${totalTime}ms`);
      
      // All requests should succeed
      for (let i = 0; i < responses.length; i++) {
        assertEquals(responses[i].status, 200, `Request ${i + 1} should return 200`);
        // Consume response body to prevent resource leak
        await responses[i].text();
      }
      
      console.log(`✅ Concurrent requests test passed: ${totalTime}ms for 5 requests`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Concurrent requests test failed:`, errorMessage);
      throw new Error(`Concurrent requests test failed: ${errorMessage}`);
    }
  });
});

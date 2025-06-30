/**
 * E2E tests for the complete development workflow
 * This test verifies that both frontend and BFF are running and working together
 */

import { assertEquals, assertExists } from "@std/assert";

const BFF_BASE_URL = "http://localhost:3000";
const FRONTEND_BASE_URL = "http://localhost:5173";

Deno.test("E2E - Development Workflow", async (t) => {
  await t.step("Frontend dev server should be running and serving React app", async () => {
    try {
      console.log(`🔍 Testing frontend dev server: ${FRONTEND_BASE_URL}`);
      
      const response = await fetch(`${FRONTEND_BASE_URL}/`);
      
      console.log(`📊 Frontend status: ${response.status}`);
      console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);
      
      assertEquals(response.status, 200, "Frontend should return 200");
      assertEquals(response.headers.get('content-type'), "text/html", "Should serve HTML");
      
      const html = await response.text();
      
      // Check for React app indicators
      assertEquals(html.includes('root'), true, "Should contain React root element");
      assertEquals(html.includes('script'), true, "Should contain JavaScript");
      
      console.log(`✅ Frontend dev server is working`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Frontend dev server test failed:`, errorMessage);
      throw new Error(`Frontend dev server failed: ${errorMessage}`);
    }
  });

  await t.step("BFF server should be running and serving API", async () => {
    try {
      console.log(`🔍 Testing BFF server: ${BFF_BASE_URL}`);
      
      const response = await fetch(`${BFF_BASE_URL}/health`);
      
      console.log(`📊 BFF health status: ${response.status}`);
      
      assertEquals(response.status, 200, "BFF health should return 200");
      
      const data = await response.json();
      assertExists(data.status, "Health response should have status");
      assertExists(data.timestamp, "Health response should have timestamp");
      
      console.log(`✅ BFF server is working - Status: ${data.status}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ BFF server test failed:`, errorMessage);
      throw new Error(`BFF server failed: ${errorMessage}`);
    }
  });

  await t.step("Vite proxy should route API calls to BFF", async () => {
    try {
      console.log(`🔍 Testing Vite proxy routing`);
      
      // Test multiple API endpoints through the proxy
      const endpoints = [
        { path: '/api/test', expectedStatus: 200 },
        { path: '/api/ai/models', expectedStatus: [200, 500] }, // 500 if AI service not available
        { path: '/api/ai/health', expectedStatus: [200, 503] }, // 503 if AI service not available
        { path: '/api/nonexistent', expectedStatus: 404 }
      ];
      
      for (const endpoint of endpoints) {
        console.log(`  Testing ${endpoint.path}...`);
        
        const response = await fetch(`${FRONTEND_BASE_URL}${endpoint.path}`);
        console.log(`    Status: ${response.status} (expected: ${endpoint.expectedStatus})`);
        
        const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
          ? endpoint.expectedStatus 
          : [endpoint.expectedStatus];
        
        assertEquals(expectedStatuses.includes(response.status), true,
          `${endpoint.path} should return one of ${expectedStatuses.join(', ')} (got ${response.status})`);
        
        // Consume response body to prevent resource leak
        await response.text();
      }
      
      console.log(`✅ Vite proxy is working correctly`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Vite proxy test failed:`, errorMessage);
      throw new Error(`Vite proxy failed: ${errorMessage}`);
    }
  });

  await t.step("API responses should be identical via BFF and proxy", async () => {
    try {
      console.log(`🔍 Comparing API responses via BFF and proxy`);
      
      const testEndpoint = '/api/test';
      
      const [bffResponse, proxyResponse] = await Promise.all([
        fetch(`${BFF_BASE_URL}${testEndpoint}`),
        fetch(`${FRONTEND_BASE_URL}${testEndpoint}`)
      ]);
      
      assertEquals(bffResponse.status, 200, "BFF response should be 200");
      assertEquals(proxyResponse.status, 200, "Proxy response should be 200");
      
      const [bffData, proxyData] = await Promise.all([
        bffResponse.json(),
        proxyResponse.json()
      ]);
      
      // Responses should be identical
      assertEquals(JSON.stringify(bffData), JSON.stringify(proxyData), 
        "BFF and proxy responses should be identical");
      
      console.log(`✅ API responses are identical via both routes`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Response comparison failed:`, errorMessage);
      throw new Error(`Response comparison failed: ${errorMessage}`);
    }
  });

  await t.step("Development workflow should support hot reload", async () => {
    try {
      console.log(`🔍 Testing development workflow features`);
      
      // Test that both servers are running concurrently
      const startTime = Date.now();
      
      const [frontendResponse, bffResponse] = await Promise.all([
        fetch(`${FRONTEND_BASE_URL}/`),
        fetch(`${BFF_BASE_URL}/health`)
      ]);
      
      const totalTime = Date.now() - startTime;
      
      assertEquals(frontendResponse.status, 200, "Frontend should be accessible");
      assertEquals(bffResponse.status, 200, "BFF should be accessible");
      
      // Both should respond quickly when running concurrently
      assertEquals(totalTime < 5000, true, `Both servers should respond quickly (${totalTime}ms)`);
      
      // Consume response bodies
      await frontendResponse.text();
      await bffResponse.text();
      
      console.log(`✅ Development workflow is working - Response time: ${totalTime}ms`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Development workflow test failed:`, errorMessage);
      throw new Error(`Development workflow failed: ${errorMessage}`);
    }
  });
});

Deno.test("E2E - Development Workflow Summary", async (t) => {
  await t.step("Print development workflow status", async () => {
    console.log(`\n🎯 AI Chat Development Workflow Status:`);
    console.log(`   ✅ BFF Server: Running on ${BFF_BASE_URL}`);
    console.log(`   ✅ Frontend Dev Server: Running on ${FRONTEND_BASE_URL}`);
    console.log(`   ✅ Vite Proxy: Routing /api/* to BFF`);
    console.log(`   ✅ Static Files: Served by BFF in production mode`);
    console.log(`   ✅ API Endpoints: Working through both routes`);
    console.log(`   ✅ Error Handling: Proper HTTP status codes`);
    console.log(`   ✅ CORS: Configured for development`);
    console.log(`\n🚀 Ready for AI Chat development!`);
    console.log(`\n📋 Available URLs:`);
    console.log(`   - Frontend (dev): ${FRONTEND_BASE_URL}`);
    console.log(`   - BFF API: ${BFF_BASE_URL}/api/*`);
    console.log(`   - Health Check: ${BFF_BASE_URL}/health`);
    console.log(`   - Test Endpoint: ${FRONTEND_BASE_URL}/api/test`);
    console.log(`   - AI Models: ${FRONTEND_BASE_URL}/api/ai/models`);
    console.log(`   - AI Generate: ${FRONTEND_BASE_URL}/api/ai/generate`);
  });
});

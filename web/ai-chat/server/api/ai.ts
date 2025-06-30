/**
 * AI Service API Route Handlers
 * 
 * Handles all AI-related endpoints for the AI Chat BFF server.
 * These routes proxy requests to the internal AI API service.
 */

import { Hono } from 'hono';
import { createSimpleClient } from "@one/ai-api";
import type { Context } from 'hono';

// Configuration
const AI_API_PORT = parseInt(Deno.env.get("AI_API_PORT") || "8000", 10);
const AI_API_HOST = Deno.env.get("AI_API_HOST") || "localhost";
const INTERNAL_AI_API_URL = `http://${AI_API_HOST}:${AI_API_PORT}`;

// Initialize AI client using SDK
const aiClient = createSimpleClient(INTERNAL_AI_API_URL);

// Create AI routes
export const aiRoutes = new Hono();

/**
 * GET /api/ai/health - Check AI service health
 */
aiRoutes.get('/health', async (c: Context) => {
  try {
    console.log(`🤖 [${new Date().toISOString()}] Checking AI service health at ${INTERNAL_AI_API_URL}`);
    
    const health = await aiClient.getHealth();
    
    console.log(`✅ [${new Date().toISOString()}] AI service health check successful`);
    
    return c.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] AI service health check failed:`, error);
    
    return c.json({
      success: false,
      error: 'AI service health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 503);
  }
});

/**
 * GET /api/ai/models - Get available AI models
 */
aiRoutes.get('/models', async (c: Context) => {
  try {
    console.log(`🤖 [${new Date().toISOString()}] Fetching available AI models`);
    
    const models = await aiClient.getModels();
    
    console.log(`✅ [${new Date().toISOString()}] Successfully fetched ${models.length} AI models`);
    
    return c.json({
      success: true,
      data: { models }
    });
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Failed to fetch AI models:`, error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch AI models',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /api/ai/generate - Generate AI text response
 */
aiRoutes.post('/generate', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    console.log(`🤖 [${new Date().toISOString()}] Generating AI text response`);
    console.log(`   Model: ${body.model || 'default'}`);
    console.log(`   Messages: ${body.messages?.length || 0} messages`);
    
    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return c.json({
        success: false,
        error: 'Invalid request: messages array is required'
      }, 400);
    }
    
    // Validate message format
    for (const message of body.messages) {
      if (!message.role || !message.content) {
        return c.json({
          success: false,
          error: 'Invalid message format: role and content are required'
        }, 400);
      }
    }
    
    const response = await aiClient.generateText({
      messages: body.messages,
      model: body.model,
      maxTokens: body.maxTokens,
      temperature: body.temperature
    });
    
    console.log(`✅ [${new Date().toISOString()}] AI text generation successful`);
    console.log(`   Response length: ${response.content?.length || 0} characters`);
    console.log(`   Tokens used: ${response.usage?.totalTokens || 'unknown'}`);
    
    return c.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] AI text generation failed:`, error);
    
    return c.json({
      success: false,
      error: 'Failed to generate AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /api/ai/generate-object - Generate structured AI response (for future use)
 */
aiRoutes.post('/generate-object', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    console.log(`🤖 [${new Date().toISOString()}] Generating structured AI response`);
    
    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return c.json({
        success: false,
        error: 'Invalid request: messages array is required'
      }, 400);
    }
    
    if (!body.schema) {
      return c.json({
        success: false,
        error: 'Invalid request: schema is required for structured generation'
      }, 400);
    }
    
    const response = await aiClient.generateObject({
      messages: body.messages,
      schema: body.schema,
      model: body.model
    });
    
    console.log(`✅ [${new Date().toISOString()}] Structured AI generation successful`);
    
    return c.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Structured AI generation failed:`, error);
    
    return c.json({
      success: false,
      error: 'Failed to generate structured AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

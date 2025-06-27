/**
 * AI Service API Route Handlers
 * 
 * Handles all AI-related endpoints for the Todo App BFF server.
 * These routes proxy requests to the internal AI API service.
 */

import { Hono } from 'hono';
import { createSimpleClient } from "@one/ai-api";
import type { Context } from 'hono';

// Configuration
const INTERNAL_AI_API_URL = Deno.env.get("INTERNAL_AI_API_URL") || "http://localhost:8000";

// Initialize AI client
const aiClient = createSimpleClient(INTERNAL_AI_API_URL);

// Create AI routes
export const aiRoutes = new Hono();

/**
 * Generate task suggestions based on user input
 * POST /api/ai/generate-tasks
 */
aiRoutes.post('/generate-tasks', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    // Validate request
    if (!body.prompt || typeof body.prompt !== 'string') {
      return c.json({ error: 'Prompt is required and must be a string' }, 400);
    }

    const taskCount = body.taskCount || 3;
    const context = body.context || '';
    
    const prompt = `Generate ${taskCount} practical todo tasks based on this request: "${body.prompt}"${context ? `\nContext: ${context}` : ''}

Please create realistic, actionable tasks that a person could actually complete. Each task should have:
- A clear, specific title
- A brief description explaining what needs to be done
- An appropriate priority level (low, medium, high)
- A relevant category if applicable
- An estimated credit cost (1-10 credits based on complexity)

Make the tasks diverse and helpful. Focus on practical, achievable goals.`;

    const response = await aiClient.generateObject({
      messages: [
        { role: "system", content: "You are a helpful productivity assistant that creates practical, actionable todo tasks." },
        { role: "user", content: prompt }
      ],
      schema: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                category: { type: "string" },
                estimatedCredits: { type: "number", minimum: 1, maximum: 10 }
              },
              required: ["title", "description", "priority", "estimatedCredits"]
            }
          }
        },
        required: ["tasks"]
      },
      model: "gpt-4.1-nano"
    });

    return c.json({ 
      success: true, 
      data: response.object.tasks 
    });
  } catch (error) {
    console.error("Error generating tasks:", error);
    return c.json({ 
      error: 'Failed to generate AI task suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Categorize a task based on title and description
 * POST /api/ai/categorize-task
 */
aiRoutes.post('/categorize-task', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    if (!body.title || typeof body.title !== 'string') {
      return c.json({ error: 'Title is required and must be a string' }, 400);
    }

    const taskInfo = body.description ? `${body.title}: ${body.description}` : body.title;
    
    const response = await aiClient.generateObject({
      messages: [
        { role: "system", content: "You are a task categorization assistant. Analyze tasks and suggest appropriate categories." },
        { role: "user", content: `Categorize this task: "${taskInfo}"\n\nSuggest a single, concise category name (e.g., "Work", "Personal", "Health", "Learning", "Shopping", "Home", etc.)` }
      ],
      schema: {
        type: "object",
        properties: {
          category: { type: "string" }
        },
        required: ["category"]
      },
      model: "gpt-4.1-nano"
    });

    return c.json({ 
      success: true, 
      data: { category: response.object.category }
    });
  } catch (error) {
    console.error("Error categorizing task:", error);
    return c.json({ 
      success: true, 
      data: { category: "General" } // Fallback category
    });
  }
});

/**
 * Get completion suggestions for a task
 * POST /api/ai/completion-suggestions
 */
aiRoutes.post('/completion-suggestions', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    if (!body.title || typeof body.title !== 'string') {
      return c.json({ error: 'Title is required and must be a string' }, 400);
    }

    const response = await aiClient.generateObject({
      messages: [
        { role: "system", content: "You are a productivity coach. Provide helpful tips for completing tasks efficiently." },
        { role: "user", content: `Give me 3 practical tips for completing this task:\nTitle: ${body.title}\nDescription: ${body.description || 'No description'}\nPriority: ${body.priority || 'medium'}` }
      ],
      schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 3
          }
        },
        required: ["suggestions"]
      },
      model: "gpt-4.1-nano"
    });

    return c.json({ 
      success: true, 
      data: { suggestions: response.object.suggestions }
    });
  } catch (error) {
    console.error("Error getting completion suggestions:", error);
    return c.json({ 
      success: true, 
      data: { 
        suggestions: [
          "Break the task into smaller steps",
          "Set a specific time to work on it",
          "Remove distractions and focus"
        ]
      }
    });
  }
});

/**
 * Generate motivational message
 * POST /api/ai/motivational-message
 */
aiRoutes.post('/motivational-message', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    const completedCount = body.completedCount || 0;
    const totalCount = body.totalCount || 0;

    const response = await aiClient.generateText({
      messages: [
        { role: "system", content: "You are an encouraging productivity coach. Create short, positive messages to motivate users." },
        { role: "user", content: `Create a motivational message for someone who has completed ${completedCount} out of ${totalCount} tasks today. Keep it brief and encouraging.` }
      ],
      model: "gpt-4.1-nano",
      maxTokens: 100
    });

    return c.json({ 
      success: true, 
      data: { message: response.content }
    });
  } catch (error) {
    console.error("Error generating motivational message:", error);
    
    const fallbackMessages = [
      "Great progress! Keep up the momentum! 🚀",
      "You're doing amazing! Every task completed is a step forward! ✨",
      "Fantastic work! You're building great habits! 💪",
      "Excellent! You're crushing your goals today! 🎯",
      "Outstanding progress! Stay focused and keep going! 🌟"
    ];
    
    return c.json({ 
      success: true, 
      data: { 
        message: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
      }
    });
  }
});

/**
 * Check AI service health
 * GET /api/ai/health
 */
aiRoutes.get('/health', async (c: Context) => {
  try {
    const health = await aiClient.getHealth();
    return c.json({ 
      success: true, 
      data: {
        status: health.status,
        models: health.models || []
      }
    });
  } catch (error) {
    console.error("Error checking AI service health:", error);
    return c.json({ 
      error: 'AI service is unavailable',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 503);
  }
});

/**
 * Get available AI models
 * GET /api/ai/models
 */
aiRoutes.get('/models', async (c: Context) => {
  try {
    const models = await aiClient.getModels();
    return c.json({ 
      success: true, 
      data: { models }
    });
  } catch (error) {
    console.error("Error getting available models:", error);
    return c.json({ 
      success: true, 
      data: { models: ["gpt-4.1-nano"] }
    });
  }
});

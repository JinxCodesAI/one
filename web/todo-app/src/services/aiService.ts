/**
 * AI Service Integration
 * Handles AI-powered task generation and smart suggestions
 */

import { createSimpleClient } from "@one/ai-api";
import type { AITaskSuggestion, AIGenerationRequest, Todo } from "../types.ts";

class AIService {
  private client: ReturnType<typeof createSimpleClient>;

  constructor() {
    const aiApiUrl = this.getAIApiUrl();
    this.client = createSimpleClient(aiApiUrl);
  }

  private getAIApiUrl(): string {
    // Check for Vite environment variable first
    if (typeof window !== "undefined") {
      // @ts-ignore - Vite injects these at build time
      return import.meta.env?.VITE_AI_API_URL || "http://localhost:8000";
    }
    
    // Fallback for server-side or testing
    return Deno?.env?.get("AI_API_URL") || "http://localhost:8000";
  }

  /**
   * Generate task suggestions based on user input
   */
  async generateTaskSuggestions(request: AIGenerationRequest): Promise<AITaskSuggestion[]> {
    try {
      const taskCount = request.taskCount || 3;
      const context = request.context ? `\nContext: ${request.context}` : '';
      
      const prompt = `Generate ${taskCount} practical todo tasks based on this request: "${request.prompt}"${context}

Please create realistic, actionable tasks that a person could actually complete. Each task should have:
- A clear, specific title
- A brief description explaining what needs to be done
- An appropriate priority level (low, medium, high)
- A relevant category if applicable
- An estimated credit cost (1-10 credits based on complexity)

Make the tasks diverse and helpful. Focus on practical, achievable goals.`;

      const response = await this.client.generateObject({
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
        model: "gpt-4o"
      });

      return response.object.tasks.map((task: any) => ({
        title: task.title,
        description: task.description,
        priority: task.priority as 'low' | 'medium' | 'high',
        category: task.category,
        estimatedCredits: task.estimatedCredits
      }));
    } catch (error) {
      console.error("Error generating task suggestions:", error);
      throw new Error("Failed to generate AI task suggestions");
    }
  }

  /**
   * Generate smart categorization for a task
   */
  async categorizeTask(title: string, description?: string): Promise<string> {
    try {
      const taskInfo = description ? `${title}: ${description}` : title;
      
      const response = await this.client.generateObject({
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
        model: "gpt-4.1-nano" // Use faster model for simple categorization
      });

      return response.object.category;
    } catch (error) {
      console.error("Error categorizing task:", error);
      return "General"; // Fallback category
    }
  }

  /**
   * Generate task completion suggestions
   */
  async getCompletionSuggestions(todo: Todo): Promise<string[]> {
    try {
      const response = await this.client.generateObject({
        messages: [
          { role: "system", content: "You are a productivity coach. Provide helpful tips for completing tasks efficiently." },
          { role: "user", content: `Give me 3 practical tips for completing this task:\nTitle: ${todo.title}\nDescription: ${todo.description || 'No description'}\nPriority: ${todo.priority}` }
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

      return response.object.suggestions;
    } catch (error) {
      console.error("Error getting completion suggestions:", error);
      return [
        "Break the task into smaller steps",
        "Set a specific time to work on it",
        "Remove distractions and focus"
      ];
    }
  }

  /**
   * Generate a motivational message for task completion
   */
  async getMotivationalMessage(completedCount: number, totalCount: number): Promise<string> {
    try {
      const response = await this.client.generateText({
        messages: [
          { role: "system", content: "You are an encouraging productivity coach. Create short, positive messages to motivate users." },
          { role: "user", content: `Create a motivational message for someone who has completed ${completedCount} out of ${totalCount} tasks today. Keep it brief and encouraging.` }
        ],
        model: "gpt-4.1-nano",
        maxTokens: 100
      });

      return response.content;
    } catch (error) {
      console.error("Error generating motivational message:", error);
      
      // Fallback motivational messages
      const fallbackMessages = [
        "Great progress! Keep up the momentum! 🚀",
        "You're doing amazing! Every task completed is a step forward! ✨",
        "Fantastic work! You're building great habits! 💪",
        "Excellent! You're crushing your goals today! 🎯",
        "Outstanding progress! Stay focused and keep going! 🌟"
      ];
      
      return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }
  }

  /**
   * Check AI service health
   */
  async checkHealth(): Promise<{ status: string; models: string[] }> {
    try {
      const health = await this.client.getHealth();
      return {
        status: health.status,
        models: health.models || []
      };
    } catch (error) {
      console.error("Error checking AI service health:", error);
      throw new Error("AI service is unavailable");
    }
  }

  /**
   * Get available AI models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      return await this.client.getModels();
    } catch (error) {
      console.error("Error getting available models:", error);
      return ["gpt-4o"]; // Fallback to default model
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export class for testing
export { AIService };

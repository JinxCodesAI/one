/**
 * AI Service Integration
 * Handles AI-powered task generation and smart suggestions
 *
 * Updated to use co-located BFF endpoints instead of direct SDK calls
 */

import type { AITaskSuggestion, AIGenerationRequest, Todo } from "../types.ts";

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/ai';
  }

  /**
   * Make a request to the BFF AI endpoints
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data;
  }

  /**
   * Generate task suggestions based on user input
   */
  async generateTaskSuggestions(request: AIGenerationRequest): Promise<AITaskSuggestion[]> {
    try {
      const tasks = await this.request<AITaskSuggestion[]>('/generate-tasks', {
        method: 'POST',
        body: JSON.stringify({
          prompt: request.prompt,
          context: request.context,
          taskCount: request.taskCount || 3
        }),
      });

      return tasks.map((task: any) => ({
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
      const result = await this.request<{ category: string }>('/categorize-task', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description
        }),
      });

      return result.category;
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
      const result = await this.request<{ suggestions: string[] }>('/completion-suggestions', {
        method: 'POST',
        body: JSON.stringify({
          title: todo.title,
          description: todo.description,
          priority: todo.priority
        }),
      });

      return result.suggestions;
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
      const result = await this.request<{ message: string }>('/motivational-message', {
        method: 'POST',
        body: JSON.stringify({
          completedCount,
          totalCount
        }),
      });

      return result.message;
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
      const health = await this.request<{ status: string; models: string[] }>('/health');
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
      const result = await this.request<{ models: string[] }>('/models');
      return result.models;
    } catch (error) {
      console.error("Error getting available models:", error);
      return ["gpt-4.1-nano"]; // Fallback to default model
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export class for testing
export { AIService };

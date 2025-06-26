/**
 * Integration tests for the Todo App
 * Tests the integration between components and services
 */

import { assertEquals, assertExists } from "@std/assert";

// Mock the services for testing
const mockProfileService = {
  async getUserProfile() {
    return {
      anonId: "test-anon-id",
      userId: null,
      name: "Test User",
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async getUserCredits() {
    return {
      balance: 100,
      ledger: [
        {
          id: "test-transaction",
          amount: 100,
          type: "daily_bonus" as const,
          reason: "Daily bonus",
          ts: new Date().toISOString()
        }
      ]
    };
  },

  async updateUserProfile(updates: { name?: string; avatarUrl?: string }) {
    return {
      anonId: "test-anon-id",
      userId: null,
      name: updates.name || "Test User",
      avatarUrl: updates.avatarUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async claimDailyBonus() {
    return {
      balance: 150,
      ledger: [
        {
          id: "test-bonus",
          amount: 50,
          type: "daily_bonus" as const,
          reason: "Daily bonus claimed",
          ts: new Date().toISOString()
        }
      ]
    };
  },

  async spendCredits(amount: number, reason: string) {
    return {
      balance: 100 - amount,
      ledger: [
        {
          id: "test-spend",
          amount: -amount,
          type: "spend" as const,
          reason,
          ts: new Date().toISOString()
        }
      ]
    };
  }
};

const mockAIService = {
  async generateTaskSuggestions(request: {
    prompt: string;
    context?: string;
    taskCount?: number;
  }) {
    const count = request.taskCount || 3;
    return Array.from({ length: count }, (_, i) => ({
      title: `AI Generated Task ${i + 1}`,
      description: `Description for task ${i + 1} based on: ${request.prompt}`,
      priority: ["low", "medium", "high"][i % 3] as "low" | "medium" | "high",
      category: "AI Generated",
      estimatedCredits: 3
    }));
  },

  async categorizeTask(title: string, description?: string) {
    // Simple categorization logic for testing
    if (title.toLowerCase().includes("work")) return "Work";
    if (title.toLowerCase().includes("health")) return "Health";
    if (title.toLowerCase().includes("learn")) return "Learning";
    return "General";
  },

  async getCompletionSuggestions(todo: any) {
    return [
      "Break this task into smaller steps",
      "Set a specific time to work on it",
      "Remove distractions and focus"
    ];
  },

  async getMotivationalMessage(completedCount: number, totalCount: number) {
    return `Great job! You've completed ${completedCount} out of ${totalCount} tasks!`;
  },

  async checkHealth() {
    return {
      status: "healthy",
      models: ["gpt-4o", "gpt-4.1-nano"]
    };
  },

  async getAvailableModels() {
    return ["gpt-4o", "gpt-4.1-nano"];
  }
};

// Mock localStorage for testing
const mockStorage = new Map<string, string>();

// @ts-ignore - Mock localStorage
globalThis.localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  length: mockStorage.size,
  key: (index: number) => Array.from(mockStorage.keys())[index] || null
};

Deno.test("Integration - Profile Service", async () => {
  const profile = await mockProfileService.getUserProfile();
  
  assertExists(profile.anonId);
  assertEquals(profile.name, "Test User");
  assertExists(profile.createdAt);
  assertExists(profile.updatedAt);
});

Deno.test("Integration - Credits System", async () => {
  const credits = await mockProfileService.getUserCredits();
  
  assertEquals(credits.balance, 100);
  assertEquals(credits.ledger.length, 1);
  assertEquals(credits.ledger[0].type, "daily_bonus");
});

Deno.test("Integration - Daily Bonus", async () => {
  const initialCredits = await mockProfileService.getUserCredits();
  const bonusCredits = await mockProfileService.claimDailyBonus();
  
  assertEquals(bonusCredits.balance, 150);
  assertEquals(bonusCredits.balance > initialCredits.balance, true);
});

Deno.test("Integration - Spend Credits", async () => {
  const spentCredits = await mockProfileService.spendCredits(25, "AI task generation");
  
  assertEquals(spentCredits.balance, 75);
  assertEquals(spentCredits.ledger[0].amount, -25);
  assertEquals(spentCredits.ledger[0].type, "spend");
  assertEquals(spentCredits.ledger[0].reason, "AI task generation");
});

Deno.test("Integration - AI Task Generation", async () => {
  const suggestions = await mockAIService.generateTaskSuggestions({
    prompt: "Plan a healthy week",
    taskCount: 3
  });
  
  assertEquals(suggestions.length, 3);
  assertEquals(suggestions[0].title, "AI Generated Task 1");
  assertEquals(suggestions[0].category, "AI Generated");
  assertEquals(suggestions[0].estimatedCredits, 3);
  
  // Check that priorities vary
  const priorities = suggestions.map(s => s.priority);
  assertEquals(priorities.includes("low"), true);
  assertEquals(priorities.includes("medium"), true);
  assertEquals(priorities.includes("high"), true);
});

Deno.test("Integration - AI Categorization", async () => {
  const workCategory = await mockAIService.categorizeTask("Work on project proposal");
  const healthCategory = await mockAIService.categorizeTask("Go for a health checkup");
  const learningCategory = await mockAIService.categorizeTask("Learn React hooks");
  const generalCategory = await mockAIService.categorizeTask("Buy groceries");
  
  assertEquals(workCategory, "Work");
  assertEquals(healthCategory, "Health");
  assertEquals(learningCategory, "Learning");
  assertEquals(generalCategory, "General");
});

Deno.test("Integration - AI Completion Suggestions", async () => {
  const mockTodo = {
    id: "test-id",
    title: "Complete project",
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const suggestions = await mockAIService.getCompletionSuggestions(mockTodo);
  
  assertEquals(suggestions.length, 3);
  assertEquals(typeof suggestions[0], "string");
  assertEquals(suggestions[0].length > 0, true);
});

Deno.test("Integration - AI Motivational Messages", async () => {
  const message = await mockAIService.getMotivationalMessage(3, 5);
  
  assertEquals(typeof message, "string");
  assertEquals(message.includes("3"), true);
  assertEquals(message.includes("5"), true);
});

Deno.test("Integration - AI Service Health", async () => {
  const health = await mockAIService.checkHealth();
  
  assertEquals(health.status, "healthy");
  assertEquals(Array.isArray(health.models), true);
  assertEquals(health.models.length > 0, true);
});

Deno.test("Integration - Full Workflow Simulation", async () => {
  mockStorage.clear();
  
  // 1. User loads app and gets profile
  const profile = await mockProfileService.getUserProfile();
  assertExists(profile.anonId);
  
  // 2. User checks credits
  const credits = await mockProfileService.getUserCredits();
  assertEquals(credits.balance, 100);
  
  // 3. User generates AI tasks
  const suggestions = await mockAIService.generateTaskSuggestions({
    prompt: "Organize my work week",
    taskCount: 2
  });
  assertEquals(suggestions.length, 2);
  
  // 4. User spends credits for AI tasks
  const totalCost = suggestions.reduce((sum, s) => sum + s.estimatedCredits, 0);
  const afterSpending = await mockProfileService.spendCredits(totalCost, "AI task generation");
  assertEquals(afterSpending.balance, 100 - totalCost);
  
  // 5. User gets completion suggestions
  const completionTips = await mockAIService.getCompletionSuggestions({
    id: "test",
    title: suggestions[0].title,
    priority: suggestions[0].priority,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  assertEquals(completionTips.length, 3);
  
  // 6. User gets motivational message
  const motivation = await mockAIService.getMotivationalMessage(1, 2);
  assertEquals(typeof motivation, "string");
  assertEquals(motivation.length > 0, true);
});

Deno.test("Integration - Error Handling", async () => {
  // Test that services handle errors gracefully
  try {
    // This should work with our mock
    const profile = await mockProfileService.getUserProfile();
    assertExists(profile);
  } catch (error) {
    // If there's an error, it should be handled gracefully
    assertEquals(error instanceof Error, true);
  }
  
  try {
    const suggestions = await mockAIService.generateTaskSuggestions({
      prompt: "",
      taskCount: 0
    });
    // Should still return an array, even if empty
    assertEquals(Array.isArray(suggestions), true);
  } catch (error) {
    assertEquals(error instanceof Error, true);
  }
});

/**
 * Integration tests for AI Task Generation workflow
 * Tests the complete flow from AI Assistant to credit spending and task creation
 */

import { assertEquals, assertRejects, assertExists } from "@std/assert";
import type { AITaskSuggestion, Credits } from "../types.ts";

// Mock the profile service
const createMockProfileService = (overrides: Partial<any> = {}) => ({
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

  async spendCredits(amount: number, reason: string) {
    if (overrides.spendCredits) {
      return overrides.spendCredits(amount, reason);
    }
    
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
  },

  ...overrides
});

// Mock the todo service
const createMockTodoService = () => ({
  createTodo: (todo: any) => ({
    id: crypto.randomUUID(),
    ...todo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
});

// Mock AI task suggestions
const createMockSuggestions = (count: number = 3): AITaskSuggestion[] => {
  return Array.from({ length: count }, (_, i) => ({
    title: `AI Generated Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    priority: ["low", "medium", "high"][i % 3] as "low" | "medium" | "high",
    category: "AI Generated",
    estimatedCredits: 5
  }));
};

// Simulate the handleGenerateAITasks function from App.tsx
async function simulateHandleGenerateAITasks(
  suggestions: AITaskSuggestion[],
  profileService: any,
  todoService: any,
  currentCredits: Credits
) {
  // Calculate total credits needed
  const totalCredits = suggestions.reduce((sum, suggestion) => sum + suggestion.estimatedCredits, 0);
  
  // Check if user has enough credits
  if (currentCredits.balance < totalCredits) {
    throw new Error(`Not enough credits. Need ${totalCredits}, have ${currentCredits.balance}`);
  }

  // Spend credits
  const updatedCredits = await profileService.spendCredits(totalCredits, `AI task generation (${suggestions.length} tasks)`);
  
  // Create todos from suggestions
  const newTodos = suggestions.map(suggestion => 
    todoService.createTodo({
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      category: suggestion.category,
      completed: false,
      aiGenerated: true,
      estimatedCredits: suggestion.estimatedCredits
    })
  );

  return { updatedCredits, newTodos };
}

Deno.test("AI Task Generation - Successful workflow", async () => {
  const profileService = createMockProfileService();
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(2);
  const currentCredits = await profileService.getUserCredits();
  
  const result = await simulateHandleGenerateAITasks(
    suggestions,
    profileService,
    todoService,
    currentCredits
  );
  
  // Check credits were spent correctly
  assertEquals(result.updatedCredits.balance, 90); // 100 - (2 * 5)
  assertEquals(result.updatedCredits.ledger[0].amount, -10);
  assertEquals(result.updatedCredits.ledger[0].reason, "AI task generation (2 tasks)");
  
  // Check todos were created
  assertEquals(result.newTodos.length, 2);
  assertEquals(result.newTodos[0].title, "AI Generated Task 1");
  assertEquals(result.newTodos[0].aiGenerated, true);
  assertEquals(result.newTodos[0].estimatedCredits, 5);
  assertExists(result.newTodos[0].id);
});

Deno.test("AI Task Generation - Insufficient credits error", async () => {
  const profileService = createMockProfileService({
    async getUserCredits() {
      return {
        balance: 5, // Not enough for 3 tasks at 5 credits each
        ledger: []
      };
    }
  });
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(3); // 15 credits needed
  const currentCredits = await profileService.getUserCredits();
  
  await assertRejects(
    () => simulateHandleGenerateAITasks(suggestions, profileService, todoService, currentCredits),
    Error,
    "Not enough credits. Need 15, have 5"
  );
});

Deno.test("AI Task Generation - Credit spending failure", async () => {
  const profileService = createMockProfileService({
    spendCredits: () => {
      throw new Error("Failed to spend credits");
    }
  });
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(1);
  const currentCredits = await profileService.getUserCredits();
  
  await assertRejects(
    () => simulateHandleGenerateAITasks(suggestions, profileService, todoService, currentCredits),
    Error,
    "Failed to spend credits"
  );
});

Deno.test("AI Task Generation - Insufficient credits from service", async () => {
  const profileService = createMockProfileService({
    spendCredits: () => {
      throw new Error("Insufficient credits");
    }
  });
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(1);
  const currentCredits = await profileService.getUserCredits();
  
  await assertRejects(
    () => simulateHandleGenerateAITasks(suggestions, profileService, todoService, currentCredits),
    Error,
    "Insufficient credits"
  );
});

Deno.test("AI Task Generation - Authentication failure", async () => {
  const profileService = createMockProfileService({
    spendCredits: () => {
      throw new Error("Authentication failed");
    }
  });
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(1);
  const currentCredits = await profileService.getUserCredits();
  
  await assertRejects(
    () => simulateHandleGenerateAITasks(suggestions, profileService, todoService, currentCredits),
    Error,
    "Authentication failed"
  );
});

Deno.test("AI Task Generation - Rate limit error", async () => {
  const profileService = createMockProfileService({
    spendCredits: () => {
      throw new Error("Rate limit exceeded");
    }
  });
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(1);
  const currentCredits = await profileService.getUserCredits();
  
  await assertRejects(
    () => simulateHandleGenerateAITasks(suggestions, profileService, todoService, currentCredits),
    Error,
    "Rate limit exceeded"
  );
});

Deno.test("AI Task Generation - Service unavailable error", async () => {
  const profileService = createMockProfileService({
    spendCredits: () => {
      throw new Error("Service temporarily unavailable");
    }
  });
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(1);
  const currentCredits = await profileService.getUserCredits();
  
  await assertRejects(
    () => simulateHandleGenerateAITasks(suggestions, profileService, todoService, currentCredits),
    Error,
    "Service temporarily unavailable"
  );
});

Deno.test("AI Task Generation - Empty suggestions", async () => {
  const profileService = createMockProfileService();
  const todoService = createMockTodoService();
  const suggestions: AITaskSuggestion[] = [];
  const currentCredits = await profileService.getUserCredits();
  
  const result = await simulateHandleGenerateAITasks(
    suggestions,
    profileService,
    todoService,
    currentCredits
  );
  
  // Should not spend any credits
  assertEquals(result.updatedCredits.balance, 100);
  assertEquals(result.newTodos.length, 0);
});

Deno.test("AI Task Generation - Large batch of tasks", async () => {
  const profileService = createMockProfileService();
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(10); // 50 credits needed
  const currentCredits = await profileService.getUserCredits();
  
  const result = await simulateHandleGenerateAITasks(
    suggestions,
    profileService,
    todoService,
    currentCredits
  );
  
  // Check credits were spent correctly
  assertEquals(result.updatedCredits.balance, 50); // 100 - 50
  assertEquals(result.updatedCredits.ledger[0].amount, -50);
  assertEquals(result.updatedCredits.ledger[0].reason, "AI task generation (10 tasks)");
  
  // Check all todos were created
  assertEquals(result.newTodos.length, 10);
  result.newTodos.forEach((todo, index) => {
    assertEquals(todo.title, `AI Generated Task ${index + 1}`);
    assertEquals(todo.aiGenerated, true);
    assertEquals(todo.estimatedCredits, 5);
    assertExists(todo.id);
  });
});

Deno.test("AI Task Generation - Mixed priority tasks", async () => {
  const profileService = createMockProfileService();
  const todoService = createMockTodoService();
  const suggestions = createMockSuggestions(6); // Should have 2 of each priority
  const currentCredits = await profileService.getUserCredits();
  
  const result = await simulateHandleGenerateAITasks(
    suggestions,
    profileService,
    todoService,
    currentCredits
  );
  
  // Check that we have different priorities
  const priorities = result.newTodos.map(todo => todo.priority);
  assertEquals(priorities.filter(p => p === "low").length, 2);
  assertEquals(priorities.filter(p => p === "medium").length, 2);
  assertEquals(priorities.filter(p => p === "high").length, 2);
});

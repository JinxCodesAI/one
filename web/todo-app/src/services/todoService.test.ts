/**
 * Tests for TodoService
 * Basic unit tests to ensure todo management works correctly
 */

import { assertEquals, assertExists } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { TodoService } from "./todoService.ts";

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

// Helper function to ensure clean state for each test
function clearTestStorage() {
  mockStorage.clear();
}

describe("TodoService", () => {
  // Helper function to create a unique storage key for each test
  function createUniqueStorageKey(testName: string): string {
    return `test-${testName}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  beforeEach(() => {
    clearTestStorage();
  });

  it("should create a todo", () => {
    const todoService = new TodoService(createUniqueStorageKey("create-todo"));

    const todoData = {
      title: "Test Task",
      description: "Test Description",
      priority: "medium" as const,
      category: "Test",
      completed: false,
      aiGenerated: false
    };

    const todo = todoService.createTodo(todoData);

    assertEquals(todo.title, "Test Task");
    assertEquals(todo.description, "Test Description");
    assertEquals(todo.priority, "medium");
    assertEquals(todo.category, "Test");
    assertEquals(todo.completed, false);
    assertEquals(todo.aiGenerated, false);
    assertExists(todo.id);
    assertExists(todo.createdAt);
    assertExists(todo.updatedAt);
  });

  it("should get todos", () => {
    const todoService = new TodoService(createUniqueStorageKey("get-todos"));

    // Initially empty
    assertEquals(todoService.getTodos().length, 0);

    // Create a todo
    todoService.createTodo({
      title: "Test Task",
      priority: "low",
      completed: false,
      aiGenerated: false
    });

    // Should have one todo
    const todos = todoService.getTodos();
    assertEquals(todos.length, 1);
    assertEquals(todos[0].title, "Test Task");
  });

  it("should update a todo", async () => {
    const todoService = new TodoService(createUniqueStorageKey("update-todo"));

    const todo = todoService.createTodo({
      title: "Original Title",
      priority: "low",
      completed: false,
      aiGenerated: false
    });

    // Add a small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1));

    const updatedTodo = todoService.updateTodo(todo.id, {
      title: "Updated Title",
      completed: true,
      priority: "high"
    });

    assertExists(updatedTodo);
    assertEquals(updatedTodo!.title, "Updated Title");
    assertEquals(updatedTodo!.completed, true);
    assertEquals(updatedTodo!.priority, "high");
    assertEquals(updatedTodo!.id, todo.id);
    assertEquals(updatedTodo!.createdAt, todo.createdAt);

    // Verify the todo was actually updated in storage
    const todos = todoService.getTodos();
    assertEquals(todos.length, 1);
    assertEquals(todos[0].title, "Updated Title");
    assertEquals(todos[0].completed, true);
    assertEquals(todos[0].priority, "high");
  });

  it("should delete a todo", () => {
    const todoService = new TodoService(createUniqueStorageKey("delete-todo"));

    const todo = todoService.createTodo({
      title: "To Delete",
      priority: "medium",
      completed: false,
      aiGenerated: false
    });

    // Should exist
    assertEquals(todoService.getTodos().length, 1);

    // Delete it
    const deleted = todoService.deleteTodo(todo.id);
    assertEquals(deleted, true);

    // Should be gone
    assertEquals(todoService.getTodos().length, 0);
  });

  it("should toggle a todo", () => {
    const todoService = new TodoService(createUniqueStorageKey("toggle-todo"));

    const todo = todoService.createTodo({
      title: "To Toggle",
      priority: "medium",
      completed: false,
      aiGenerated: false
    });

    // Toggle to completed
    const toggled1 = todoService.toggleTodo(todo.id);
    assertExists(toggled1);
    assertEquals(toggled1!.completed, true);

    // Toggle back to incomplete
    const toggled2 = todoService.toggleTodo(todo.id);
    assertExists(toggled2);
    assertEquals(toggled2!.completed, false);
  });

  it("should filter todos", () => {
    const todoService = new TodoService(createUniqueStorageKey("filter-todos"));

    // Create test todos
    todoService.createTodo({
      title: "Active High Priority",
      priority: "high",
      category: "Work",
      completed: false,
      aiGenerated: false
    });

    todoService.createTodo({
      title: "Completed Low Priority",
      priority: "low",
      category: "Personal",
      completed: true,
      aiGenerated: false
    });

    todoService.createTodo({
      title: "Active Medium Priority",
      priority: "medium",
      category: "Work",
      completed: false,
      aiGenerated: false
    });

    const allTodos = todoService.getTodos();

    // Filter by status
    const activeTodos = todoService.filterTodos(allTodos, { status: "active" });
    assertEquals(activeTodos.length, 2);

    const completedTodos = todoService.filterTodos(allTodos, { status: "completed" });
    assertEquals(completedTodos.length, 1);

    // Filter by priority
    const highPriorityTodos = todoService.filterTodos(allTodos, {
      status: "all",
      priority: "high"
    });
    assertEquals(highPriorityTodos.length, 1);

    // Filter by category
    const workTodos = todoService.filterTodos(allTodos, {
      status: "all",
      category: "Work"
    });
    assertEquals(workTodos.length, 2);

    // Filter by search
    const searchTodos = todoService.filterTodos(allTodos, {
      status: "all",
      search: "Active"
    });
    assertEquals(searchTodos.length, 2);
  });

  it("should get todo stats", () => {
    const todoService = new TodoService(createUniqueStorageKey("get-stats"));

    // Create test todos
    todoService.createTodo({
      title: "High Priority Active",
      priority: "high",
      category: "Work",
      completed: false,
      aiGenerated: false
    });

    todoService.createTodo({
      title: "Medium Priority Completed",
      priority: "medium",
      category: "Personal",
      completed: true,
      aiGenerated: false
    });

    todoService.createTodo({
      title: "Low Priority Active",
      priority: "low",
      category: "Work",
      completed: false,
      aiGenerated: false
    });

    const todos = todoService.getTodos();
    const stats = todoService.getTodoStats(todos);

    assertEquals(stats.total, 3);
    assertEquals(stats.completed, 1);
    assertEquals(stats.active, 2);
    assertEquals(stats.byPriority.high, 1);
    assertEquals(stats.byPriority.medium, 1);
    assertEquals(stats.byPriority.low, 1);
    assertEquals(stats.byCategory.Work, 2);
    assertEquals(stats.byCategory.Personal, 1);
  });

  it("should get categories", () => {
    const todoService = new TodoService(createUniqueStorageKey("get-categories"));

    // Create todos with different categories
    todoService.createTodo({
      title: "Work Task",
      priority: "medium",
      category: "Work",
      completed: false,
      aiGenerated: false
    });

    todoService.createTodo({
      title: "Personal Task",
      priority: "medium",
      category: "Personal",
      completed: false,
      aiGenerated: false
    });

    todoService.createTodo({
      title: "Another Work Task",
      priority: "medium",
      category: "Work",
      completed: false,
      aiGenerated: false
    });

    todoService.createTodo({
      title: "No Category Task",
      priority: "medium",
      completed: false,
      aiGenerated: false
    });

    const todos = todoService.getTodos();
    const categories = todoService.getCategories(todos);

    assertEquals(categories.length, 2);
    assertEquals(categories.includes("Work"), true);
    assertEquals(categories.includes("Personal"), true);
  });

  it("should persist storage", () => {
    const storageKey = createUniqueStorageKey("persistence");
    const todoService1 = new TodoService(storageKey);

    // Create todo with first instance
    todoService1.createTodo({
      title: "Persistent Task",
      priority: "medium",
      completed: false,
      aiGenerated: false
    });

    // Create new instance (simulates page reload)
    const todoService2 = new TodoService(storageKey);
    const todos = todoService2.getTodos();

    assertEquals(todos.length, 1);
    assertEquals(todos[0].title, "Persistent Task");
  });
});

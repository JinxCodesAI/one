/**
 * Todo Service
 * Handles local storage and management of todo items
 */

import type { Todo, TodoFilter } from "../types.ts";

class TodoService {
  private readonly STORAGE_KEY: string;
  private readonly STORAGE_VERSION = "1.0";

  constructor(storageKey = "ai-todo-app-todos") {
    this.STORAGE_KEY = storageKey;
  }

  /**
   * Get all todos from local storage
   */
  getTodos(): Todo[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const data = JSON.parse(stored);
      
      // Check version compatibility
      if (data.version !== this.STORAGE_VERSION) {
        console.warn("Todo storage version mismatch, clearing data");
        this.clearTodos();
        return [];
      }

      return data.todos || [];
    } catch (error) {
      console.error("Error loading todos from storage:", error);
      return [];
    }
  }

  /**
   * Save todos to local storage
   */
  saveTodos(todos: Todo[]): void {
    try {
      const data = {
        version: this.STORAGE_VERSION,
        todos,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving todos to storage:", error);
      throw new Error("Failed to save todos");
    }
  }

  /**
   * Create a new todo
   */
  createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: this.generateId(),
      ...todoData,
      createdAt: now,
      updatedAt: now
    };

    const todos = this.getTodos();
    todos.push(todo);
    this.saveTodos(todos);

    return todo;
  }

  /**
   * Update an existing todo
   */
  updateTodo(id: string, updates: Partial<Todo>): Todo | null {
    const todos = this.getTodos();
    const index = todos.findIndex(todo => todo.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedTodo = {
      ...todos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    todos[index] = updatedTodo;
    this.saveTodos(todos);

    return updatedTodo;
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: string): boolean {
    const todos = this.getTodos();
    const filteredTodos = todos.filter(todo => todo.id !== id);
    
    if (filteredTodos.length === todos.length) {
      return false; // Todo not found
    }

    this.saveTodos(filteredTodos);
    return true;
  }

  /**
   * Toggle todo completion status
   */
  toggleTodo(id: string): Todo | null {
    const todos = this.getTodos();
    const todo = todos.find(t => t.id === id);
    
    if (!todo) {
      return null;
    }

    return this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * Filter todos based on criteria
   */
  filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
    let filtered = [...todos];

    // Filter by status
    if (filter.status === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter.status === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // Filter by priority
    if (filter.priority) {
      filtered = filtered.filter(todo => todo.priority === filter.priority);
    }

    // Filter by category
    if (filter.category) {
      filtered = filtered.filter(todo => todo.category === filter.category);
    }

    // Filter by search term
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
        (todo.category && todo.category.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }

  /**
   * Get todo statistics
   */
  getTodoStats(todos: Todo[]): {
    total: number;
    completed: number;
    active: number;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const stats = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length,
      byPriority: { low: 0, medium: 0, high: 0 },
      byCategory: {} as Record<string, number>
    };

    todos.forEach(todo => {
      // Count by priority
      stats.byPriority[todo.priority]++;

      // Count by category
      const category = todo.category || 'Uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get unique categories from todos
   */
  getCategories(todos: Todo[]): string[] {
    const categories = new Set<string>();
    
    todos.forEach(todo => {
      if (todo.category) {
        categories.add(todo.category);
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Clear all todos
   */
  clearTodos(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export todos as JSON
   */
  exportTodos(): string {
    const todos = this.getTodos();
    return JSON.stringify({
      version: this.STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      todos
    }, null, 2);
  }

  /**
   * Import todos from JSON
   */
  importTodos(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;

      if (!data.todos || !Array.isArray(data.todos)) {
        throw new Error("Invalid data format");
      }

      const existingTodos = this.getTodos();
      const existingIds = new Set(existingTodos.map(t => t.id));

      data.todos.forEach((todoData: unknown, index: number) => {
        try {
          // Type guard for todoData
          if (!todoData || typeof todoData !== 'object') {
            errors.push(`Todo ${index + 1}: Invalid data format`);
            return;
          }

          const todo = todoData as Record<string, unknown>;

          // Validate required fields
          if (!todo.title || typeof todo.title !== 'string') {
            errors.push(`Todo ${index + 1}: Missing or invalid title`);
            return;
          }

          // Skip if ID already exists
          if (todo.id && typeof todo.id === 'string' && existingIds.has(todo.id)) {
            errors.push(`Todo ${index + 1}: ID already exists, skipping`);
            return;
          }

          // Create todo with validation
          const validatedTodo: Todo = {
            id: (typeof todo.id === 'string' ? todo.id : null) || this.generateId(),
            title: todo.title,
            description: (typeof todo.description === 'string' ? todo.description : undefined) || undefined,
            completed: Boolean(todo.completed),
            priority: ['low', 'medium', 'high'].includes(todo.priority as string) ? (todo.priority as 'low' | 'medium' | 'high') : 'medium',
            category: (typeof todo.category === 'string' ? todo.category : undefined) || undefined,
            dueDate: (typeof todo.dueDate === 'string' ? todo.dueDate : undefined) || undefined,
            createdAt: (typeof todo.createdAt === 'string' ? todo.createdAt : null) || new Date().toISOString(),
            updatedAt: (typeof todo.updatedAt === 'string' ? todo.updatedAt : null) || new Date().toISOString(),
            aiGenerated: Boolean(todo.aiGenerated),
            estimatedCredits: (typeof todo.estimatedCredits === 'number' ? todo.estimatedCredits : undefined) || undefined
          };

          existingTodos.push(validatedTodo);
          imported++;
        } catch (error) {
          errors.push(`Todo ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      if (imported > 0) {
        this.saveTodos(existingTodos);
      }

      return { success: true, imported, errors };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Generate a unique ID for todos
   */
  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Export singleton instance
export const todoService = new TodoService();

// Export class for testing
export { TodoService };

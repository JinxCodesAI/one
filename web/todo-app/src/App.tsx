import { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ProfileCard } from './components/ProfileCard.tsx';
import { TodoList } from './components/TodoList.tsx';
import { TodoForm } from './components/TodoForm.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { StatsCard } from './components/StatsCard.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { ErrorMessage } from './components/ErrorMessage.tsx';
import { profileService } from './services/profileService.ts';
import { aiService } from './services/aiService.ts';
import { todoService } from './services/todoService.ts';
import type { AppState, Todo, TodoFilter, AITaskSuggestion } from './types.ts';
import './App.css';

const initialState: AppState = {
  user: null,
  credits: null,
  todos: [],
  filter: {
    status: 'all',
    search: ''
  },
  loading: {
    profile: true,
    credits: true,
    todos: false,
    ai: false
  },
  error: null
};

function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Initialize app data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load todos from local storage immediately
      const todos = todoService.getTodos();
      setState(prev => ({ ...prev, todos }));

      // Load user profile and credits
      await Promise.all([
        loadUserProfile(),
        loadUserCredits()
      ]);
    } catch (error) {
      console.error('Error initializing app:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize application',
        loading: { profile: false, credits: false, todos: false, ai: false }
      }));
    }
  };

  const loadUserProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, profile: true } }));
      const profile = await profileService.getUserProfile();
      setState(prev => ({
        ...prev,
        user: profile,
        loading: { ...prev.loading, profile: false }
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load user profile',
        loading: { ...prev.loading, profile: false }
      }));
    }
  };

  const loadUserCredits = async () => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, credits: true } }));
      const credits = await profileService.getUserCredits();
      setState(prev => ({
        ...prev,
        credits,
        loading: { ...prev.loading, credits: false }
      }));
    } catch (error) {
      console.error('Error loading credits:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load credits',
        loading: { ...prev.loading, credits: false }
      }));
    }
  };

  const handleUpdateProfile = async (updates: { name?: string; avatarUrl?: string }) => {
    try {
      const updatedProfile = await profileService.updateUserProfile(updates);
      setState(prev => ({ ...prev, user: updatedProfile }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setState(prev => ({ ...prev, error: 'Failed to update profile' }));
    }
  };

  const handleClaimBonus = async () => {
    try {
      const credits = await profileService.claimDailyBonus();
      setState(prev => ({ ...prev, credits }));
    } catch (error) {
      console.error('Error claiming bonus:', error);
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
    }
  };

  const handleCreateTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTodo = todoService.createTodo(todoData);
      setState(prev => ({ ...prev, todos: [...prev.todos, newTodo] }));
      setShowTodoForm(false);
    } catch (error) {
      console.error('Error creating todo:', error);
      setState(prev => ({ ...prev, error: 'Failed to create todo' }));
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = todoService.updateTodo(id, updates);
      if (updatedTodo) {
        setState(prev => ({
          ...prev,
          todos: prev.todos.map(todo => todo.id === id ? updatedTodo : todo)
        }));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setState(prev => ({ ...prev, error: 'Failed to update todo' }));
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const success = todoService.deleteTodo(id);
      if (success) {
        setState(prev => ({
          ...prev,
          todos: prev.todos.filter(todo => todo.id !== id)
        }));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setState(prev => ({ ...prev, error: 'Failed to delete todo' }));
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const updatedTodo = todoService.toggleTodo(id);
      if (updatedTodo) {
        setState(prev => ({
          ...prev,
          todos: prev.todos.map(todo => todo.id === id ? updatedTodo : todo)
        }));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      setState(prev => ({ ...prev, error: 'Failed to toggle todo' }));
    }
  };

  const handleGenerateAITasks = async (suggestions: AITaskSuggestion[]) => {
    try {
      // Calculate total credits needed
      const totalCredits = suggestions.reduce((sum, suggestion) => sum + suggestion.estimatedCredits, 0);
      
      // Check if user has enough credits
      if (!state.credits || state.credits.balance < totalCredits) {
        setState(prev => ({ 
          ...prev, 
          error: `Not enough credits. Need ${totalCredits}, have ${state.credits?.balance || 0}` 
        }));
        return;
      }

      // Spend credits
      await profileService.spendCredits(totalCredits, `AI task generation (${suggestions.length} tasks)`);
      
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

      // Update state
      setState(prev => ({
        ...prev,
        todos: [...prev.todos, ...newTodos]
      }));

      // Refresh credits
      await loadUserCredits();
      setShowAIAssistant(false);
    } catch (error) {
      console.error('Error generating AI tasks:', error);
      setState(prev => ({ ...prev, error: 'Failed to generate AI tasks' }));
    }
  };

  const handleFilterChange = (newFilter: TodoFilter) => {
    setState(prev => ({ ...prev, filter: newFilter }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Filter todos based on current filter
  const filteredTodos = todoService.filterTodos(state.todos, state.filter);
  const todoStats = todoService.getTodoStats(state.todos);
  const categories = todoService.getCategories(state.todos);

  if (state.loading.profile || state.loading.credits) {
    return (
      <div className="app-loading">
        <LoadingSpinner size="large" />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      {state.error && (
        <ErrorMessage message={state.error} onClose={clearError} />
      )}

      <div className="container">
        <div className="app-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            {state.user && state.credits && (
              <ProfileCard
                profile={state.user}
                credits={state.credits}
                onUpdateProfile={handleUpdateProfile}
                onClaimBonus={handleClaimBonus}
              />
            )}
            
            <StatsCard stats={todoStats} />
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="content-header">
              <h2>Your Tasks</h2>
              <div className="content-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAIAssistant(true)}
                  disabled={!state.credits || state.credits.balance < 1}
                >
                  ✨ AI Assistant
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowTodoForm(true)}
                >
                  + Add Task
                </button>
              </div>
            </div>

            <FilterBar
              filter={state.filter}
              categories={categories}
              onFilterChange={handleFilterChange}
            />

            <TodoList
              todos={filteredTodos}
              onToggle={handleToggleTodo}
              onEdit={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />

            {filteredTodos.length === 0 && state.todos.length > 0 && (
              <div className="empty-state">
                <p>No tasks match your current filters.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleFilterChange({ status: 'all', search: '' })}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {state.todos.length === 0 && (
              <div className="empty-state">
                <h3>Welcome to your AI-powered todo app!</h3>
                <p>Get started by creating your first task or let AI help you.</p>
                <div className="empty-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowTodoForm(true)}
                  >
                    Create Your First Task
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowAIAssistant(true)}
                    disabled={!state.credits || state.credits.balance < 1}
                  >
                    ✨ Get AI Suggestions
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {showTodoForm && (
        <TodoForm
          onSubmit={handleCreateTodo}
          onCancel={() => setShowTodoForm(false)}
        />
      )}

      {showAIAssistant && state.credits && (
        <AIAssistant
          onGenerateTasks={handleGenerateAITasks}
          creditsBalance={state.credits.balance}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
}

export default App;

# AI-Powered Todo App - Development Guide

This guide provides detailed information for developers working on the AI-powered todo application with **co-located Backend-For-Frontend (BFF) architecture**.

## 🏗️ Architecture Overview

### Design Principles

1. **Co-located BFF Pattern**: Secure service integration through dedicated BFF server
2. **Component-Based**: Modular React components with clear responsibilities
3. **Type-Safe**: Comprehensive TypeScript coverage with strict mode
4. **Responsive**: Mobile-first design with progressive enhancement
5. **Performance**: Optimized with Vite and modern React patterns
6. **Security-First**: No direct client access to internal services

### Data Flow

```
User Interaction → React Components → BFF API Layer → Internal Services
                                   ↓
                              Local Storage ← Todo Management
```

**Detailed Flow:**
```
[Browser] → [Frontend:5173] → [BFF:3000] → [AI API:8000]
                           → [BFF:3000] → [Profile:8080]
```

## 🔧 Development Setup

### Prerequisites

- Deno 2.3.6+
- Understanding of Hono framework (BFF server)
- React 19 and TypeScript experience
- Knowledge of the monorepo structure

### Environment Setup

1. **Clone and Navigate**:
   ```bash
   cd web/todo-app
   ```

2. **Install Dependencies** (handled by Deno):
   ```bash
   deno cache src/main.tsx server/index.ts
   ```

3. **Start Internal Services**:
   ```bash
   # Terminal 1: AI API
   cd ../../internal/ai-api && deno task dev

   # Terminal 2: Profile Service
   cd ../../internal/profile-service && deno task dev

   # Terminal 3: Todo App (BFF + Frontend)
   deno task dev
   ```

This starts both the BFF server (port 3000) and frontend dev server (port 5173).

### Development Workflow

1. **Dual Server Setup**: BFF server handles API requests, Vite serves frontend
2. **Hot Reload**: Vite provides instant frontend updates, Deno watch restarts BFF
3. **API Proxying**: Frontend automatically proxies `/api/*` calls to BFF server
4. **Type Checking**: TypeScript errors appear in console and editor
5. **Testing**: Run comprehensive test suite (unit, integration, E2E)
6. **Debugging**: Use browser dev tools, React DevTools, and Deno debugger

### Alternative Development Commands

```bash
# Start only frontend (requires BFF running separately)
deno task dev:frontend

# Start only BFF server
deno task dev:server

# Run tests in watch mode
deno task test:watch

# Build for production
deno task build

# Serve production build
deno task serve
```

## 📁 Project Structure Deep Dive

### Components Architecture

```
src/components/
├── common/              # Shared components
│   ├── Header.tsx       # App branding and navigation
│   ├── LoadingSpinner.tsx # Reusable loading indicator
│   └── ErrorMessage.tsx # Error display component
├── ProfileCard.tsx      # User profile management
├── StatsCard.tsx        # Progress visualization
├── FilterBar.tsx        # Search and filtering UI
├── TodoList.tsx         # Todo container with grouping
├── TodoItem.tsx         # Individual todo with inline editing
├── TodoForm.tsx         # Modal form for creating todos
└── AIAssistant.tsx      # AI-powered task generation
```

### BFF Server Architecture

```
server/
├── api/                 # Route handlers
│   ├── ai.ts           # AI service proxy routes
│   └── profile.ts      # Profile service proxy routes
├── middleware/          # Server middleware
│   ├── errorHandler.ts # Global error handling
│   └── validation.ts   # Request validation & rate limiting
├── utils/              # Server utilities
│   └── serviceClient.ts # Internal service communication
└── index.ts            # Main server entry point
```

### Services Layer (Frontend)

```
src/services/
├── aiService.ts         # BFF AI endpoints (/api/ai/*)
├── profileService.ts    # BFF Profile endpoints (/api/profile/*)
└── todoService.ts       # Local storage management
```

### Type System

```
src/types.ts             # Comprehensive type definitions
├── Todo                 # Core todo item structure
├── UserProfile          # Profile service types
├── Credits              # Credits and transactions
├── AITaskSuggestion     # AI-generated suggestions
└── AppState             # Application state management
```

## 🎨 Styling Architecture

### CSS Organization

1. **Global Styles** (`src/index.css`):
   - CSS reset and base styles
   - Utility classes
   - Design system tokens

2. **Component Styles** (`src/App.css`):
   - Layout and grid systems
   - Component-specific styles
   - Responsive breakpoints

3. **Inline Styles**:
   - Dynamic styles based on props/state
   - Component-scoped styling

### Design System

```css
/* Color Palette */
--primary: #3b82f6;
--secondary: #6b7280;
--success: #10b981;
--danger: #ef4444;
--warning: #f59e0b;

/* Spacing Scale */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;

/* Typography */
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
```

## 🔌 Service Integration

### AI Service Integration

```typescript
// Example: Generating task suggestions
const suggestions = await aiService.generateTaskSuggestions({
  prompt: "Plan a healthy week",
  context: "I'm a beginner",
  taskCount: 3
});
```

**Key Features**:
- Task generation with structured output
- Smart categorization
- Completion suggestions
- Motivational messages

### Profile Service Integration

```typescript
// Example: Managing user credits
const credits = await profileService.getUserCredits();
await profileService.spendCredits(5, "AI task generation");
```

**Key Features**:
- Anonymous user management
- Credits system with transactions
- Daily bonus claiming
- Profile customization

### Local Storage Management

```typescript
// Example: Todo persistence
const todos = todoService.getTodos();
const newTodo = todoService.createTodo(todoData);
todoService.updateTodo(id, updates);
```

**Key Features**:
- Versioned storage format
- Data validation and migration
- Export/import functionality
- Offline-first approach

## 🧪 Testing Strategy

### Unit Testing

```typescript
// Example test structure
import { assertEquals } from "@std/assert";
import { todoService } from "../src/services/todoService.ts";

Deno.test("TodoService - Create Todo", () => {
  const todo = todoService.createTodo({
    title: "Test Task",
    priority: "medium",
    completed: false
  });
  
  assertEquals(todo.title, "Test Task");
  assertEquals(todo.completed, false);
});
```

### Integration Testing

```typescript
// Example integration test
Deno.test("AI Service Integration", async () => {
  const suggestions = await aiService.generateTaskSuggestions({
    prompt: "Test prompt",
    taskCount: 1
  });
  
  assertEquals(suggestions.length, 1);
  assertEquals(typeof suggestions[0].title, "string");
});
```

### E2E Testing

```typescript
// Example E2E test with Playwright
import { test, expect } from "playwright";

test("Create and complete todo", async ({ page }) => {
  await page.goto("http://localhost:3000");
  
  // Create todo
  await page.click('[data-testid="add-todo-btn"]');
  await page.fill('[data-testid="todo-title"]', "Test Task");
  await page.click('[data-testid="create-btn"]');
  
  // Complete todo
  await page.click('[data-testid="todo-checkbox"]');
  
  // Verify completion
  await expect(page.locator('[data-testid="completed-section"]')).toContainText("Test Task");
});
```

## 🚀 Performance Optimization

### React Optimization

1. **Component Memoization**:
   ```typescript
   const TodoItem = React.memo(({ todo, onToggle, onEdit, onDelete }) => {
     // Component implementation
   });
   ```

2. **Callback Optimization**:
   ```typescript
   const handleToggle = useCallback((id: string) => {
     onToggle(id);
   }, [onToggle]);
   ```

3. **State Management**:
   - Minimize re-renders with proper state structure
   - Use local state for UI-only changes
   - Batch state updates when possible

### Build Optimization

1. **Vite Configuration**:
   - Tree shaking for smaller bundles
   - Code splitting for lazy loading
   - Asset optimization

2. **TypeScript Compilation**:
   - Strict mode for better optimization
   - Proper type annotations
   - Dead code elimination

## 🔒 Security Considerations

### Data Protection

1. **Local Storage**:
   - No sensitive data in localStorage
   - Data validation on read/write
   - Graceful handling of corrupted data

2. **API Integration**:
   - Proper error handling
   - Input validation
   - Rate limiting awareness

3. **Cross-Domain**:
   - Secure cookie handling
   - CORS configuration
   - CSP headers

## 🐛 Debugging Guide

### Common Issues

1. **Service Connection**:
   ```bash
   # Check service health
   curl http://localhost:8000/health
   curl http://localhost:8080/health
   ```

2. **TypeScript Errors**:
   ```bash
   # Clear cache and reload
   deno cache --reload src/main.tsx
   ```

3. **Build Issues**:
   ```bash
   # Clean and rebuild
   rm -rf dist/
   deno task build
   ```

### Development Tools

1. **React DevTools**: Component inspection and profiling
2. **Browser DevTools**: Network, console, and performance
3. **Deno Inspector**: Server-side debugging
4. **TypeScript Language Server**: IDE integration

## 📈 Monitoring and Analytics

### Performance Metrics

- Component render times
- API response times
- Bundle size analysis
- Core Web Vitals

### Error Tracking

- JavaScript error boundaries
- API error logging
- User action tracking
- Performance monitoring

## 🔄 Deployment

### Build Process

```bash
# Production build
deno task build

# Verify build
deno task preview
```

### Environment Variables

```env
# Production configuration
VITE_AI_API_URL=https://api.example.com
VITE_PROFILE_API_URL=https://profile.example.com
VITE_DEV_MODE=false
```

### Static Hosting

The app builds to static files suitable for:
- Deno Deploy
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## 🤝 Contributing Guidelines

### Code Standards

1. **TypeScript**: Strict mode, proper typing
2. **React**: Functional components, hooks
3. **CSS**: BEM methodology, responsive design
4. **Testing**: Comprehensive coverage

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with description
5. Address review feedback

### Code Review Checklist

- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Responsive design works
- [ ] Accessibility standards met
- [ ] Performance impact assessed
- [ ] Documentation updated

## 📚 Additional Resources

- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Deno Manual](https://deno.land/manual)
- [AI API Documentation](../../internal/ai-api/README.md)
- [Profile Service Documentation](../../internal/profile-service/README.md)

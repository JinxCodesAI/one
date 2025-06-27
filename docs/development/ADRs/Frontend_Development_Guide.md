# Frontend Development Guide

**Status**: Active  
**Date**: 2025-06-25

## Overview

This guide outlines the frontend development standards, architecture, and best practices for the One monorepo. It provides a comprehensive reference for creating and maintaining frontend applications within our ecosystem, following the co-located BFF pattern for secure service integration.

## Architecture

### Core Technologies

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.x with Deno integration
- **Backend-For-Frontend**: Co-located Deno server
- **Styling**: Modern CSS with custom properties
- **State Management**: React hooks with context API
- **Testing**: Comprehensive test suite (unit, integration, E2E)
- **Package Management**: Deno-native with npm compatibility

### Application Structure

All frontend applications follow a consistent structure with co-located BFF:

```
web/app-name/
├── src/                # Frontend source code
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API client interfaces
│   ├── utils/          # Utility functions
│   ├── types.ts        # TypeScript types
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── server/             # Co-located BFF implementation
│   ├── api/            # API route handlers
│   ├── middleware/     # Server middleware
│   ├── utils/          # Server utilities
│   └── index.ts        # Server entry point
├── e2e/                # End-to-end tests
├── public/             # Static assets
├── dist/               # Build output
├── server.ts           # Production server entry point
├── deno.json           # Deno configuration
└── vite.config.ts      # Vite configuration
```

### Component Organization

Components should be organized by feature or domain, with shared components in a common directory:

```
src/components/
├── common/             # Shared components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── feature-a/          # Feature-specific components
│   ├── FeatureAList.tsx
│   └── ...
└── feature-b/          # Another feature
    ├── FeatureBForm.tsx
    └── ...
```

## Development Workflow

### Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-org/one-monorepo.git
   cd one-monorepo
   ```

2. **Install Dependencies**:
   ```bash
   # Install Deno
   curl -fsSL https://deno.land/x/install/install.sh | sh
   
   # Verify installation
   deno --version
   ```

3. **Start Development Server**:
   ```bash
   # For AI Chat application
   cd web/ai-chat
   deno task dev
   
   # For Todo application
   cd web/todo-app
   deno task dev
   ```

### Common Tasks

- **Development**: `deno task dev` (starts both frontend and BFF)
- **Frontend Only**: `deno task dev:frontend`
- **BFF Only**: `deno task dev:server`
- **Build**: `deno task build`
- **Preview**: `deno task preview`
- **Testing**: `deno task test`
- **Linting**: `deno task lint`
- **Formatting**: `deno task fmt`

## Coding Standards

### TypeScript

- Use strict mode for all TypeScript files
- Define explicit types for all function parameters and return values
- Use interfaces for object shapes and types for unions/primitives
- Avoid `any` type; use `unknown` when type is truly unknown

### React

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization when appropriate
- Follow the React hooks rules (no conditional hooks, etc.)
- Use custom hooks to share logic between components

### CSS

- Use CSS modules or styled-components for component styling
- Follow BEM methodology for class naming
- Use CSS variables for theming and consistent values
- Implement responsive design with mobile-first approach

### File Naming

- **Components**: PascalCase (e.g., `Button.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Test Files**: Same name as the file being tested with `.test.ts` suffix

## Testing

Our frontend applications follow the comprehensive testing strategy outlined in the [Testing Guide Comprehensive](./Testing_Guide_Comprehensive.md). Key points specific to frontend testing:

- **Component Tests**: Test individual React components in isolation
- **Hook Tests**: Test custom hooks with React Testing Library
- **Integration Tests**: Test interactions between components and services
- **E2E Tests**: Test complete user flows with browser automation
- **BFF Tests**: Test server-side API routes and middleware

For detailed testing instructions, refer to the comprehensive testing guide.

## Service Integration

### Co-located BFF Pattern

All frontend applications must implement the co-located BFF pattern for secure service integration:

1. **Frontend**: Makes API calls to its own co-located BFF server
2. **BFF Server**: Authenticates and proxies requests to internal services
3. **Internal Services**: Only accessible from within the internal network

```
[Browser] → [Frontend] → [Co-located BFF] → [Internal Services]
```

### BFF Implementation

Each web application must include a server implementation:

```typescript
// web/app-name/server.ts
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';

// Configuration
const INTERNAL_SERVICE_URL = Deno.env.get("INTERNAL_SERVICE_URL");
const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");
const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);

const app = new Hono();

// API routes
const api = app.basePath('/api');

api.post('/endpoint', async (c) => {
  // Validate request
  const body = await c.req.json();
  
  // Forward to internal service with authentication
  const response = await fetch(`${INTERNAL_SERVICE_URL}/endpoint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-API-Key": INTERNAL_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  return new Response(response.body, { status: response.status });
});

// Static file serving
app.use('*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));

// Start server
console.log(`Server starting on http://localhost:${PORT}`);
serve({
  fetch: app.fetch,
  port: PORT,
});
```

### Frontend Service Clients

Frontend applications communicate with their co-located BFF through service clients:

```typescript
// src/services/aiService.ts
export class AIService {
  private baseUrl: string;
  
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }
  
  async generateText(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  }
}
```

### Error Handling

Implement consistent error handling across all service calls:

1. **BFF Layer**: Handle service errors and transform into appropriate HTTP responses
2. **Service Layer**: Catch HTTP errors and transform into application-specific errors
3. **Component Layer**: Handle errors with appropriate UI feedback
4. **Global Error Boundary**: Catch uncaught errors at the application level

## Performance Optimization

### Code Splitting

Use dynamic imports for route-based code splitting:

```typescript
const FeatureComponent = React.lazy(() => import('./FeatureComponent'));
```

### Memoization

Use React.memo and useMemo for expensive computations:

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### Bundle Analysis

Regularly analyze bundle size:

```bash
deno task build --analyze
```

## Accessibility

- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers
- Aim for WCAG 2.1 AA compliance

## Internationalization

Use the built-in i18n system:

```typescript
import { useTranslation } from '@one/i18n';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

## Deployment

Frontend applications are deployed as containerized applications with their co-located BFF:

1. **Build**: `deno task build`
2. **Test**: `deno task test`
3. **Containerize**: Build Docker image with frontend assets and BFF server
4. **Deploy**: Deploy container to production environment

## Security Considerations

- **No Direct Service Access**: Frontend code must never directly access internal services
- **API Key Management**: Internal service API keys must only exist in the BFF layer
- **Request Validation**: BFF must validate all incoming requests before forwarding
- **CORS Configuration**: Set appropriate CORS policies to prevent unauthorized access
- **Rate Limiting**: Implement rate limiting at the BFF layer to prevent abuse

## Conclusion

This guide provides a foundation for frontend development in the One monorepo, emphasizing the co-located BFF pattern for secure service integration. By following these standards and practices, we ensure consistent, maintainable, and secure frontend applications.

## References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Deno Manual](https://deno.land/manual)
- [Testing Guide Comprehensive](./Testing_Guide_Comprehensive.md)
- [Secure Architecture Migration Guide](../../security/secure-architecture-migration.md)

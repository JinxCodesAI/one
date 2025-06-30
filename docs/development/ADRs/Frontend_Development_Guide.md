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
- **E2E Testing**: `deno task test:e2e`
- **Linting**: `deno task lint`
- **Formatting**: `deno task fmt`

### Development Environment Setup

Before starting development, ensure all required services are running:

1. **Start Internal Services** (if needed):
   ```bash
   # Profile Service
   cd internal/profile-service && deno task dev

   # AI API Service
   cd internal/ai-api && deno task dev
   ```

2. **Configure Environment Variables**:
   ```bash
   # Copy and customize environment configuration
   cp .env.example .env
   # Edit .env with correct service ports and URLs
   ```

3. **Verify Service Connectivity**:
   ```bash
   # Run E2E tests to verify all services are connected
   deno task test:e2e
   ```

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

### E2E Testing Requirements

All frontend applications must include comprehensive E2E tests that verify:

1. **Service Connectivity**: BFF can connect to all required internal services
2. **API Endpoints**: All API routes work correctly through both BFF and Vite proxy
3. **Error Handling**: Proper error responses for invalid requests
4. **Development Workflow**: Frontend dev server and Vite proxy work correctly

Example E2E test structure:

```typescript
// e2e/bff-connectivity.e2e.ts
Deno.test("BFF should connect to Profile Service", async () => {
  const response = await fetch("http://localhost:3000/api/profile/user-info", {
    headers: { "X-Anon-Id": "test-user" }
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
});

Deno.test("Vite proxy should route to BFF", async () => {
  const response = await fetch("http://localhost:5173/api/test");
  assertEquals(response.status, 200);
});
```

### Testing with Real Services

E2E tests should run against real internal services when possible:

```bash
# Start all required services before running E2E tests
cd internal/profile-service && deno task dev &
cd internal/ai-api && deno task dev &
cd web/todo-app && deno task dev &

# Run E2E tests
deno task test:e2e
```

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

Each web application must include a server implementation following the co-located pattern:

#### Environment Configuration

Use centralized environment variables for service discovery:

```bash
# .env file
# BFF Server Configuration
PORT=3000
NODE_ENV=development

# Internal Service Configuration (use ports, not full URLs)
AI_API_PORT=8000
PROFILE_SERVICE_PORT=8081
AI_API_HOST=localhost
PROFILE_SERVICE_HOST=localhost

# Logging Configuration
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_DETAILS=true
```

#### Server Structure

Organize BFF server code in modular structure:

```
server/
├── api/                # API route handlers
│   ├── ai.ts          # AI service routes
│   ├── profile.ts     # Profile service routes
│   └── ...
├── middleware/        # Server middleware
│   ├── errorHandler.ts
│   ├── validation.ts
│   └── ...
├── utils/             # Server utilities
│   ├── serviceClient.ts
│   └── ...
└── index.ts          # Main server entry point
```

#### Server Implementation Example

```typescript
// server/index.ts
import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { load } from "@std/dotenv";

// Load environment variables
await load({ export: true });

// Configuration - construct URLs from ports
const AI_API_PORT = parseInt(Deno.env.get("AI_API_PORT") || "8000", 10);
const PROFILE_SERVICE_PORT = parseInt(Deno.env.get("PROFILE_SERVICE_PORT") || "8081", 10);
const AI_API_HOST = Deno.env.get("AI_API_HOST") || "localhost";
const PROFILE_SERVICE_HOST = Deno.env.get("PROFILE_SERVICE_HOST") || "localhost";

const INTERNAL_AI_API_URL = `http://${AI_API_HOST}:${AI_API_PORT}`;
const INTERNAL_PROFILE_API_URL = `http://${PROFILE_SERVICE_HOST}:${PROFILE_SERVICE_PORT}`;

const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);
const NODE_ENV = Deno.env.get("NODE_ENV") || "development";

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Import and use route handlers
import { aiRoutes } from './api/ai.ts';
import { profileRoutes } from './api/profile.ts';

app.route('/api/ai', aiRoutes);
app.route('/api/profile', profileRoutes);

// Health check endpoint
app.get('/health', async (c) => {
  // Check internal service health
  const services = await Promise.allSettled([
    fetch(`${INTERNAL_AI_API_URL}/health`),
    fetch(`${INTERNAL_PROFILE_API_URL}/health`)
  ]);

  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ai: { url: INTERNAL_AI_API_URL, status: services[0].status },
      profile: { url: INTERNAL_PROFILE_API_URL, status: services[1].status }
    }
  });
});

// Static file serving (production mode)
if (NODE_ENV === "production") {
  app.use('*', serveStatic({ root: './dist' }));
  app.get('*', serveStatic({ path: './dist/index.html' }));
}

// Start server
if (import.meta.main) {
  console.log(`🚀 BFF Server starting on port ${PORT}`);
  console.log(`🤖 AI API: ${INTERNAL_AI_API_URL}`);
  console.log(`👤 Profile API: ${INTERNAL_PROFILE_API_URL}`);

  Deno.serve({ port: PORT }, app.fetch);
}
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

### Service Integration Best Practices

#### Use Service SDKs When Available

Prefer using service SDKs over direct HTTP calls:

```typescript
// server/api/ai.ts
import { createSimpleClient } from "../../../../internal/ai-api/sdk/client.ts";

// Initialize AI client using SDK
const aiClient = createSimpleClient(INTERNAL_AI_API_URL);

export const aiRoutes = new Hono();

aiRoutes.get('/models', async (c) => {
  try {
    const models = await aiClient.getModels();
    return c.json({ success: true, data: models });
  } catch (error) {
    return c.json({ error: 'Failed to get models' }, 500);
  }
});
```

#### Server-side Service Clients

For services with client-side only SDKs, create server-side adapters:

```typescript
// server/utils/profileServiceClient.ts
export class ServerProfileServiceClient {
  constructor(private config: { baseUrl: string; timeout?: number }) {}

  async getUserInfo(anonId: string): Promise<UserInfoResponse> {
    const response = await this.makeRequest('GET', '/api/userinfo', anonId);
    return response as UserInfoResponse;
  }

  private async makeRequest(method: string, path: string, anonId: string, body?: unknown) {
    const url = `${this.config.baseUrl}${path}`;
    const headers = {
      'X-Anon-Id': anonId,
      'Content-Type': 'application/json'
    };

    const requestInit: RequestInit = { method, headers };
    if (body && method === 'POST') {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
}
```

#### Request Body Validation

Implement proper JSON validation middleware:

```typescript
// server/middleware/validation.ts
export const validateJSON = async (c: Context, next: Next) => {
  if (c.req.method === 'POST' || c.req.method === 'PUT' || c.req.method === 'PATCH') {
    const contentType = c.req.header('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      return c.json({ error: 'Content-Type must be application/json' }, 400);
    }

    try {
      // Only parse JSON if there's actual content
      const contentLength = parseInt(c.req.header('content-length') || '0', 10);

      if (contentLength > 0) {
        const body = await c.req.json();
        c.set('parsedBody', body);
      } else {
        // Empty body is valid for some endpoints
        c.set('parsedBody', {});
      }
    } catch (error) {
      return c.json({
        error: 'Invalid JSON in request body',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 400);
    }
  }

  await next();
};
```

### Error Handling

Implement consistent error handling across all service calls:

1. **BFF Layer**: Handle service errors and transform into appropriate HTTP responses
2. **Service Layer**: Catch HTTP errors and transform into application-specific errors
3. **Component Layer**: Handle errors with appropriate UI feedback
4. **Global Error Boundary**: Catch uncaught errors at the application level

#### Common Error Patterns

- **Empty Request Bodies**: Handle `Content-Type: application/json` with empty bodies gracefully
- **Service Unavailable**: Provide meaningful error messages when internal services are down
- **Validation Errors**: Return clear validation error messages with proper HTTP status codes
- **Rate Limiting**: Implement and handle rate limiting at the BFF level

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

### Business Logic Validation

Implement business logic validation in the BFF layer, not just in backend services:

```typescript
// Example: Daily bonus validation in BFF
export class DailyBonusValidator {
  private claims = new Map<string, { lastClaimDate: string }>();

  canClaimToday(anonId: string): boolean {
    const record = this.claims.get(anonId);
    if (!record) return true;

    const today = new Date().toISOString().split('T')[0];
    return record.lastClaimDate !== today;
  }

  recordClaim(anonId: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.claims.set(anonId, { lastClaimDate: today });
  }
}

// Use in route handler
app.post('/api/profile/claim-daily-bonus', async (c) => {
  const anonId = c.req.header('X-Anon-Id');

  if (!dailyBonusValidator.canClaimToday(anonId)) {
    return c.json({
      error: 'Daily bonus already claimed today. Try again tomorrow!',
      timeUntilNextClaim: calculateTimeUntilTomorrow()
    }, 429);
  }

  // Proceed with service call...
});
```

## Troubleshooting Common Issues

### JSON Parsing Errors

**Problem**: "Unexpected end of JSON input" errors when making POST requests with empty bodies.

**Solution**: Update JSON validation middleware to handle empty bodies:
- Check `content-length` header before parsing JSON
- Allow empty bodies for endpoints that don't require them
- Provide clear error messages for actual JSON parsing failures

### Service Connection Issues

**Problem**: BFF cannot connect to internal services.

**Solution**:
1. Verify environment variables are correctly configured
2. Ensure internal services are running on expected ports
3. Check service health endpoints directly
4. Review BFF startup logs for service URL configuration

### Vite Proxy AbortError

**Problem**: Vite proxy shows AbortError when forwarding requests to BFF.

**Solution**:
1. Ensure BFF server is stable and not crashing
2. Check for proper error handling in BFF routes
3. Verify JSON parsing doesn't fail on empty bodies
4. Configure appropriate timeouts in Vite proxy

### Port Configuration Mismatches

**Problem**: Services running on different ports than expected.

**Solution**:
1. Use consistent environment variable naming (`SERVICE_NAME_PORT`)
2. Construct URLs from ports rather than hardcoding full URLs
3. Ensure all services use the same environment variable names
4. Add startup logging to show actual service URLs

## Conclusion

This guide provides a foundation for frontend development in the One monorepo, emphasizing the co-located BFF pattern for secure service integration. By following these standards and practices, we ensure consistent, maintainable, and secure frontend applications.

Key takeaways:
- Use centralized environment configuration with port-based service discovery
- Implement proper JSON validation that handles empty request bodies
- Create comprehensive E2E tests that verify real service integration
- Use service SDKs when available, create server-side adapters when needed
- Implement business logic validation in the BFF layer for better user experience

## References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Deno Manual](https://deno.land/manual)
- [Testing Guide Comprehensive](./Testing_Guide_Comprehensive.md)
- [Secure Architecture Migration Guide](../../security/secure-architecture-migration.md)

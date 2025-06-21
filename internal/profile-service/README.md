# Profile Service

A Deno-based microservice that provides user profile management, credits system, and cross-domain identity management for the `*.jinxcodes.ai` ecosystem.

## Features

- **Anonymous Identity Management**: Stable UUID across all subdomains
- **Profile API**: User name, avatar, and preferences
- **Credits System**: Daily bonuses, balance tracking, and transaction ledger
- **Cross-Domain Storage**: Cookie + iframe localStorage fallback
- **Client SDK**: JavaScript SDK for easy integration
- **Database Abstraction**: In-memory for testing, PostgreSQL for production

## Quick Start

### Development

```bash
# Start with in-memory database (for testing)
deno task dev

# Start with PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost/profile deno task dev
```

### Testing

```bash
# Run all tests
deno task test

# Run unit tests only
deno test --allow-net --allow-env --ignore=e2e/

# Run E2E tests only
deno task test:e2e

# Watch mode
deno task test:watch
```

### Production

```bash
# Build for Linux (cross-compile)
deno compile --allow-net --allow-env --allow-read --target x86_64-unknown-linux-gnu --output profile-service-linux main.ts

# Run production server
DATABASE_URL=postgresql://user:pass@host/db deno task start
```

## API Endpoints

### Authentication

All endpoints accept authentication via:
- **Cookie**: `anon_id=<UUID>; Domain=.jinxcodes.ai`
- **Header**: `X-Anon-Id: <UUID>`

### Profile Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/userinfo` | Get current user profile |
| GET | `/api/profile` | Alias for `/userinfo` |
| POST | `/api/profile` | Update profile fields |

**Example Response:**
```json
{
  "anonId": "uuid-here",
  "userId": null,
  "name": "User Name",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Credits Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/credits` | Get balance and ledger |
| POST | `/api/credits/daily-award` | Claim daily bonus |
| POST | `/api/credits/adjust` | Admin credit adjustment |

**Example Response:**
```json
{
  "balance": 123,
  "ledger": [
    {
      "id": "uuid",
      "amount": 10,
      "type": "daily_bonus",
      "reason": "Daily bonus",
      "ts": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Service health status |
| GET | `/` | Alias for health check |

## Client SDK Usage

### Installation

```typescript
import { 
  getAnonId, 
  getUserInfo, 
  updateProfile, 
  getCredits, 
  claimDailyBonus 
} from "https://profile.jinxcodes.ai/sdk/client.ts";
```

### Basic Usage

```typescript
// Get stable anonymous ID
const anonId = await getAnonId();

// Get user profile
const profile = await getUserInfo();

// Update profile
const updated = await updateProfile({
  name: "New Name",
  avatarUrl: "https://example.com/avatar.jpg"
});

// Get credits
const credits = await getCredits();

// Claim daily bonus
const newCredits = await claimDailyBonus();
```

### Custom Configuration

```typescript
import { createProfileClient } from "https://profile.jinxcodes.ai/sdk/client.ts";

const client = createProfileClient({
  profileServiceUrl: "https://profile.jinxcodes.ai",
  cookieDomain: ".jinxcodes.ai",
  iframeTimeout: 5000
});

const profile = await client.getUserInfo();
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP server port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `CORS_ORIGINS` | `https://*.jinxcodes.ai,http://localhost:*` | Allowed CORS origins |
| `COOKIE_DOMAIN` | `.jinxcodes.ai` | Cookie domain |
| `DAILY_BONUS_AMOUNT` | `10` | Daily bonus credits |
| `INITIAL_CREDITS_AMOUNT` | `100` | Initial credits for new users |

### Example .env

```env
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/profile
CORS_ORIGINS=https://*.jinxcodes.ai,http://localhost:*
COOKIE_DOMAIN=.jinxcodes.ai
DAILY_BONUS_AMOUNT=10
INITIAL_CREDITS_AMOUNT=100
```

## Database

### In-Memory (Development/Testing)

The service uses an in-memory database adapter by default when no `DATABASE_URL` is provided. This is perfect for:
- Local development
- Unit testing
- Integration testing
- Quick prototyping

### PostgreSQL (Production)

Set `DATABASE_URL` to use PostgreSQL:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Schema:**
```sql
-- Users table
CREATE TABLE users (
  anon_id    UUID PRIMARY KEY,
  user_id    UUID UNIQUE NULL,
  name       TEXT NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Credits table
CREATE TABLE credits (
  anon_id    UUID PRIMARY KEY REFERENCES users(anon_id),
  balance    INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Credit ledger
CREATE TABLE credit_ledger (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id    UUID REFERENCES users(anon_id),
  amount     INTEGER NOT NULL,
  type       TEXT NOT NULL,
  reason     TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Architecture

### Components

- **Database Layer**: Abstract interface with memory/PostgreSQL implementations
- **HTTP Server**: Deno HTTP server with middleware
- **API Routes**: RESTful endpoints for profile and credits
- **Client SDK**: Cross-domain identity and API client
- **Static Assets**: iframe storage protocol implementation

### Cross-Domain Identity

1. **Primary**: First-party cookie `anon_id`
2. **Fallback**: iframe + localStorage via `storage.html`
3. **Generation**: UUID v4 when no existing ID found
4. **Persistence**: Both cookie and localStorage for redundancy

## Testing

### Test Structure

```
internal/profile-service/
├── database/
│   └── memory-adapter.test.ts     # Unit tests
├── server/
│   └── routes.test.ts             # Integration tests
├── e2e/
│   └── profile-service.e2e.ts     # E2E tests
└── main.test.ts                   # Configuration tests
```

### Test Commands

```bash
# All tests
deno task test

# Unit tests only
deno test --allow-net --allow-env --ignore=e2e/

# E2E tests only
deno task test:e2e

# Watch mode
deno task test:watch

# Specific test file
deno test database/memory-adapter.test.ts --allow-net --allow-env
```

## Deployment

### Docker

```dockerfile
FROM denoland/deno:alpine

WORKDIR /app
COPY . .

RUN deno cache main.ts

EXPOSE 8080

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]
```

### Environment Setup

```bash
# Production environment
export DATABASE_URL=postgresql://user:pass@host/db
export PORT=8080
export CORS_ORIGINS=https://*.jinxcodes.ai
export COOKIE_DOMAIN=.jinxcodes.ai

# Start service
deno run --allow-net --allow-env --allow-read main.ts
```

## Security

- **CORS**: Configurable allowed origins
- **Cookies**: Secure, SameSite=Lax, HttpOnly
- **Input Validation**: JSON schema validation
- **Rate Limiting**: Built-in rate limiting for sensitive endpoints
- **HTTPS**: TLS termination at reverse proxy

## Monitoring

- **Health Endpoint**: `/api/healthz` for load balancer checks
- **Logging**: Structured JSON logs to stdout
- **Metrics**: Request/response logging with timing
- **Error Handling**: Proper HTTP status codes and error messages

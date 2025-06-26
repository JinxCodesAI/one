# Profile Service Development Guide

This document provides a comprehensive guide for developers working with the Profile Service, covering its purpose, architecture, API usage, SDK integration, database management, testing, and deployment considerations.

## 1. Introduction

The Profile Service is a Deno-based microservice designed for the `*.jinxcodes.ai` ecosystem. Its primary responsibilities include:

*   **User Profile Management**: Storing and managing user-specific data such as names, avatars, and preferences.
*   **Credits System**: Implementing a credit system with daily bonuses, balance tracking, and a transaction ledger.
*   **Cross-Domain Identity Management**: Providing a stable anonymous user ID across different subdomains using a robust cookie and iframe-based fallback mechanism.

It serves as a foundational component for user-centric features across various applications within the ecosystem.

## 2. Architecture Overview

The Profile Service is structured into several key components:

*   **Database Layer**: An abstraction layer that allows the service to switch between different database implementations. Currently, it supports an in-memory database (ideal for development and testing) and a PostgreSQL adapter (intended for production). The `database/mod.ts` file handles the creation of the appropriate adapter based on the `DATABASE_URL` environment variable.
*   **HTTP Server**: Built using Deno's native HTTP server, it handles incoming requests, routes them to the appropriate handlers, and manages CORS. The main server logic resides in `server/server.ts`.
*   **API Routes**: Defines the RESTful endpoints for interacting with user profiles and the credits system. These handlers are implemented in `server/routes.ts` and interact directly with the database adapter.
*   **Client SDK**: A JavaScript/TypeScript SDK (`sdk/client.ts`) designed for easy integration into web applications. It abstracts away the complexities of API calls and cross-domain identity management.
*   **Static Assets**: Includes `storage.html` (located in `static/storage.html`), which is crucial for the iframe-based cross-domain localStorage fallback mechanism.

## 3. Getting Started (Development Setup)

### Prerequisites

*   **Deno**: Ensure Deno is installed on your system. You can find installation instructions on the [Deno website](https://deno.land/#installation).

### Running the Service

The service can be run with either an in-memory database (default) or a PostgreSQL database.

#### With In-Memory Database (for testing and quick development)

This is the default mode if no `DATABASE_URL` is provided.

```bash
deno task dev
```

This command starts the server in watch mode, automatically reloading on file changes.

#### With PostgreSQL

To use PostgreSQL, you need to set the `DATABASE_URL` environment variable.

1.  **Ensure PostgreSQL is running**: Make sure you have a PostgreSQL instance accessible.
2.  **Set `DATABASE_URL`**:

    ```bash
    # Example for local PostgreSQL
    DATABASE_URL=postgresql://user:pass@localhost:5432/profile deno task dev
    ```

    Replace `user`, `pass`, `localhost:5432`, and `profile` with your PostgreSQL credentials and database details.

### Environment Variables

The Profile Service is configured via environment variables:

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | The port on which the service will listen for incoming HTTP requests. |
| `PROFILE_SERVICE_DATABASE_URL` | (None) | Connection string for the PostgreSQL database. If not set, an in-memory database is used. Example: `postgresql://user:pass@host:port/db` |
| `CORS_ORIGINS` | `https://*.jinxcodes.ai,http://localhost:*` | Comma-separated list of allowed origins for CORS. Set to an empty string (`""`) to disable CORS. |
| `COOKIE_DOMAIN` | `.jinxcodes.ai` | The domain for setting the `anon_id` cookie. Should be a top-level domain (e.g., `.yourdomain.com`) for cross-subdomain identity. |
| `DAILY_BONUS_AMOUNT` | `10` | The amount of credits awarded to a user for claiming the daily bonus. |
| `INITIAL_CREDITS_AMOUNT` | `100` | The initial amount of credits a new user receives upon their first interaction. |

## 4. API Usage

The Profile Service exposes a RESTful API. All API endpoints accept authentication via either a `Cookie` (named `anon_id`) or an `X-Anon-Id` header. The `anon_id` is a stable UUID representing the anonymous user.

### Authentication

*   **Cookie**: `anon_id=<UUID>; Domain=.jinxcodes.ai`
*   **Header**: `X-Anon-Id: <UUID>`

### Endpoints

#### Profile Endpoints

These endpoints manage user profile information.

##### `GET /api/userinfo` or `GET /api/profile`

Retrieves the current user's profile information. If no `anon_id` is provided or found, a new anonymous ID will be generated and associated with a new user profile and initial credits.

**Method**: `GET`
**Path**: `/api/userinfo` or `/api/profile`
**Response (200 OK)**:
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

##### `POST /api/profile`

Updates specific fields of the user's profile. Only `name` and `avatarUrl` can be updated.

**Method**: `POST`
**Path**: `/api/profile`
**Request Body**:
```json
{
  "name": "New User Name",
  "avatarUrl": "https://new-avatar.com/image.png"
}
```
(Fields are optional; provide only those you wish to update)

**Response (200 OK)**: Returns the updated `UserInfoResponse` object.

#### Credits Endpoints

These endpoints manage the user's credit balance and transaction ledger.

##### `GET /api/credits`

Retrieves the user's current credit balance and a list of recent credit transactions (ledger).

**Method**: `GET`
**Path**: `/api/credits`
**Response (200 OK)**:
```json
{
  "balance": 123,
  "ledger": [
    {
      "id": "uuid-1",
      "amount": 10,
      "type": "daily_bonus",
      "reason": "Daily bonus",
      "ts": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "amount": -5,
      "type": "spend",
      "reason": "API usage",
      "ts": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```

##### `POST /api/credits/daily-award`

Allows a user to claim their daily credit bonus. This endpoint is rate-limited to once per hour per user and once per day per user.

**Method**: `POST`
**Path**: `/api/credits/daily-award`
**Request Body**: `{}` (empty object)
**Response (200 OK)**: Returns the updated `CreditsResponse` object.
**Error (429 Too Many Requests)**: If the rate limit is exceeded.
**Error (400 Bad Request)**: If the daily bonus has already been claimed today.

##### `POST /api/credits/adjust`

(Admin Function) Adjusts a user's credit balance. This endpoint is typically used for administrative purposes.

**Method**: `POST`
**Path**: `/api/credits/adjust`
**Request Body**:
```json
{
  "amount": 50,
  "reason": "Manual adjustment for testing"
}
```
**Response (200 OK)**: Returns the updated `CreditsResponse` object.

#### Health Check

##### `GET /api/healthz` or `GET /`

Checks the health status of the service, including its database connection.

**Method**: `GET`
**Path**: `/api/healthz` or `/`
**Response (200 OK)**:
```json
{
  "status": "healthy"
}
```
**Response (503 Service Unavailable)**:
```json
{
  "status": "unhealthy",
  "error": "Database connection failed"
}
```

### Error Handling

The API returns standardized JSON error responses with appropriate HTTP status codes:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
*   `VALIDATION_ERROR` (400 Bad Request): Invalid input.
*   `NOT_FOUND` (404 Not Found): Resource not found (e.g., user).
*   `RATE_LIMIT` (429 Too Many Requests): Rate limit exceeded.
*   `INTERNAL_SERVER_ERROR` (500 Internal Server Error): General server error.

## 5. Client SDK Usage

The Profile Service provides a powerful JavaScript/TypeScript SDK (`sdk/client.ts`) designed to simplify integration with web applications. It abstracts away the complexities of direct API calls, handling authentication, and robust cross-domain identity management automatically. This allows developers to focus on building features rather than managing the underlying communication protocols.

### Key Benefits of Using the SDK

*   **Simplified API Interaction**: Make calls to the Profile Service with simple function calls, without needing to construct HTTP requests or parse JSON responses manually.
*   **Automatic Authentication**: The SDK automatically manages the `anon_id` (anonymous user ID) via cookies and an iframe-based fallback, ensuring a stable user identity across different subdomains.
*   **Cross-Domain Compatibility**: Seamlessly handles scenarios where your application and the Profile Service are on different domains, crucial for modern web architectures.
*   **Type Safety**: For TypeScript projects, the SDK provides full type definitions, enhancing developer experience and reducing runtime errors.

### Installation

You can import the SDK directly from the service's URL (for Deno projects) or bundle it for web projects.

```typescript
import {
  getAnonId,
  getUserInfo,
  updateProfile,
  getCredits,
  claimDailyBonus
} from "../sdk/client.ts"; // Correct internal import path
```

### Basic Usage

The SDK provides convenience functions that use a default singleton client instance. This is the easiest way to get started.

```typescript
import {
  getAnonId,
  getUserInfo,
  updateProfile,
  getCredits,
  claimDailyBonus
} from "https://profile.jinxcodes.ai/sdk/client.ts";

async function demonstrateProfileServiceUsage() {
  console.log("--- Profile Service SDK Basic Usage ---");

  // 1. Get or create a stable anonymous ID
  // The SDK handles checking cookies, iframe storage, and generating a new ID if needed.
  const anonId = await getAnonId();
  console.log("Anonymous ID:", anonId);

  // 2. Get current user profile information
  // If this is a new anonId, a new profile will be created with initial credits.
  const profile = await getUserInfo();
  console.log("User Profile:", profile);
  console.log(`  Name: ${profile.name}`);
  console.log(`  Avatar: ${profile.avatarUrl}`);
  console.log(`  Created At: ${profile.createdAt}`);

  // 3. Update user profile
  const newName = "SDK User " + Math.floor(Math.random() * 1000);
  const newAvatar = "https://example.com/new-avatar-" + Math.floor(Math.random() * 100) + ".png";
  console.log(`Attempting to update profile to Name: "${newName}", Avatar: "${newAvatar}"`);
  const updatedProfile = await updateProfile({
    name: newName,
    avatarUrl: newAvatar
  });
  console.log("Updated Profile:", updatedProfile);
  console.log(`  New Name: ${updatedProfile.name}`);
  console.log(`  New Avatar: ${updatedProfile.avatarUrl}`);

  // 4. Get credits balance and transaction ledger
  const credits = await getCredits();
  console.log("Current Credits:", credits.balance);
  console.log("Credit Ledger (last 2 entries):", credits.ledger.slice(0, 2));

  // 5. Claim daily bonus
  try {
    console.log("Attempting to claim daily bonus...");
    const newCredits = await claimDailyBonus();
    console.log("Credits after daily bonus:", newCredits.balance);
  } catch (error) {
    console.error("Failed to claim daily bonus (this is normal if already claimed today):", (error as Error).message);
  }

  console.log("--- End of SDK Basic Usage Demo ---");
}

// Call the demonstration function
demonstrateProfileServiceUsage();
```

### Custom Configuration

For more advanced scenarios, such as local development, testing, or when running the Profile Service on a different URL, you can create a custom client instance:

```typescript
import { createProfileClient } from "https://profile.jinxcodes.ai/sdk/client.ts";

const client = createProfileClient({
  profileServiceUrl: "http://localhost:8080", // Your local service URL
  cookieDomain: "localhost", // Your local domain for cookie management
  iframeTimeout: 5000 // Timeout for iframe communication in milliseconds
});

// Now use the custom client instance for all operations
async function demonstrateCustomClientUsage() {
  console.log("--- Profile Service SDK Custom Client Usage ---");
  const profile = await client.getUserInfo();
  console.log("Profile from custom client:", profile);
  console.log("--- End of Custom Client Usage Demo ---");
}

demonstrateCustomClientUsage();
```

### Cross-Domain Identity Management Explained

The SDK employs a robust, multi-pronged strategy for managing the anonymous user ID (`anon_id`) across different subdomains, ensuring a stable and persistent user identity:

1.  **First-Party Cookie (Primary)**: The SDK first attempts to read the `anon_id` from a first-party cookie. This is the most straightforward and preferred method when the application and the Profile Service share a common top-level domain (e.g., `app.jinxcodes.ai` and `profile.jinxcodes.ai` can both access cookies set for `.jinxcodes.ai`).
2.  **Iframe-Based LocalStorage (Fallback)**: If the first-party cookie is not accessible (e.g., due to strict cross-domain security policies or if the domains are completely different), the SDK falls back to an iframe-based `localStorage` protocol. The `storage.html` file, served by the Profile Service, is loaded within a hidden iframe. This iframe acts as a bridge, allowing the SDK to store and retrieve the `anon_id` in the Profile Service's domain's `localStorage`, bypassing direct cross-origin `localStorage` restrictions.
3.  **New ID Generation**: If no existing `anon_id` is found through either the cookie or iframe methods, a new UUID v4 is generated.
4.  **Redundant Persistence**: Any newly generated or retrieved `anon_id` is then persisted in *both* the first-party cookie (if accessible) and the iframe's `localStorage` for maximum redundancy and stability across various browsing scenarios.

This layered approach ensures that the `anon_id` remains consistent for the user, even in complex cross-domain environments, providing a seamless user experience.

## 6. Database

The Profile Service supports two database adapters: in-memory and PostgreSQL.

### In-Memory Database

*   **Purpose**: Ideal for local development, unit testing, integration testing, and quick prototyping.
*   **Usage**: Used by default if the `DATABASE_URL` environment variable is not set.
*   **Implementation**: `database/memory-adapter.ts`. This adapter stores all data in memory and is not persistent across service restarts.

### PostgreSQL Database

*   **Purpose**: Designed for production environments, providing data persistence and scalability.
*   **Usage**: Activated when `DATABASE_URL` is set to a PostgreSQL connection string (e.g., `postgresql://user:pass@host:port/db`).
*   **Implementation**: `database/postgres-adapter.ts`. **Note**: As of the current version, this is a placeholder implementation that throws errors. It needs to be fully implemented to support PostgreSQL. The `README.md` provides a basic schema for PostgreSQL.

#### PostgreSQL Schema

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

## 7. Testing

The Profile Service has a comprehensive testing suite covering unit, integration, and end-to-end tests.

### Test Structure

*   `database/memory-adapter.test.ts`: Unit tests for the in-memory database adapter.
*   `server/routes.test.ts`: Integration tests for the API routes, ensuring correct request handling and database interaction.
*   `e2e/profile-service.e2e.ts`: End-to-end tests that simulate real-world scenarios, testing the service as a whole.
*   `main.test.ts`: Tests related to service configuration and startup.

### Running Tests

The `deno.json` file defines several tasks for running tests:

*   **Run all tests**:
    ```bash
    deno task test:all
    ```
*   **Run unit and integration tests only (excluding e2e)**:
    ```bash
    deno task test
    ```
*   **Run E2E tests only**:
    ```bash
    deno task test:e2e
    ```
*   **Run tests in watch mode**:
    ```bash
    deno task test:watch
    ```
*   **Run a specific test file**:
    ```bash
    deno test database/memory-adapter.test.ts --allow-net --allow-env
    ```

## 8. Deployment Considerations

### Docker

A `Dockerfile` is provided for containerizing the Profile Service.

```dockerfile
FROM denoland/deno:alpine

WORKDIR /app
COPY . .

RUN deno cache main.ts

EXPOSE 8080

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]
```

### Environment Setup for Production

When deploying to a production environment, ensure the following environment variables are set:

```bash
export PORT=8080
export DATABASE_URL=postgresql://user:pass@host:port/db # Must be set for production
export CORS_ORIGINS=https://*.jinxcodes.ai,https://your-app.com # Specific allowed origins
export COOKIE_DOMAIN=.jinxcodes.ai # Your top-level domain for cookies
export DAILY_BONUS_AMOUNT=10
export INITIAL_CREDITS_AMOUNT=100
```

Then, start the service:

```bash
deno run --allow-net --allow-env --allow-read main.ts
```

## 9. Security and Monitoring

### Security

*   **CORS**: Configurable allowed origins via `CORS_ORIGINS`.
*   **Cookies**: Secure, SameSite=Lax, HttpOnly for enhanced security.
*   **Input Validation**: JSON schema validation is used for incoming request bodies.
*   **Rate Limiting**: Implemented for sensitive endpoints like daily bonus claims.
*   **HTTPS**: Assumes TLS termination at a reverse proxy.

### Monitoring

*   **Health Endpoint**: `/api/healthz` for load balancer checks.
*   **Logging**: Structured JSON logs are output to stdout.
*   **Metrics**: Request/response logging with timing information.
*   **Error Handling**: Proper HTTP status codes and informative error messages are provided.

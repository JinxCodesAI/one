# Profile Service – Functional Specification

## Table of Contents

1. [Introduction](#introduction)
2. [Goals & Use Cases](#goals--use-cases)
3. [Requirements](#requirements)\
   3.1. [Functional Requirements](#functional-requirements)\
   3.2. [Non-Functional Requirements](#non-functional-requirements)
4. [Architecture Overview](#architecture-overview)\
   4.1. [High-Level Components](#high-level-components)\
   4.2. [Data Flow](#data-flow)
5. [API Design](#api-design)\
   5.1. [Authentication & Session](#authentication--session)\
   5.2. [Profile Endpoints](#profile-endpoints)\
   5.3. [Credits Endpoints](#credits-endpoints)
6. [Data Model](#data-model)
7. [Client SDK](#client-sdk)\
   7.1. [Responsibilities](#responsibilities)\
   7.2. [Public API](#public-api)\
   7.3. [Iframe Storage Protocol](#iframe-storage-protocol)
8. [Security Considerations](#security-considerations)
9. [Deployment & Operations](#deployment--operations)
10. [Future Roadmap](#future-roadmap)

---

## 1. Introduction

`profile.jinxcodes.ai` is a Deno-based microservice that provides:

- A **soft sign-up** mechanism (stable anonymous UUID across all
  `*.jinxcodes.ai`),
- A unified **Identity Provider** for eventual OAuth/OIDC flows,
- A **Profile** API (name, avatar, preferences),
- A **Credits** system (daily bonuses, balances, ledger),
- A small **Client SDK** to wire cookie + iframe storage logic into all frontend
  apps.

---

## 2. Goals & Use Cases

- Allow users to browse all sub-domains (e.g. `app1.`, `app2.`) without forced
  registration.
- Persist a stable “visitor ID” in a cookie (first-party) + iframe/localStorage
  (fallback).
- Expose a unified RESTful API for profile data & credits.
- Later support “real” signup/login (Google OAuth, email/password) via standard
  OIDC.
- Minimize repeated implementation: all apps import a shared JS SDK.

---

## 3. Requirements

### 3.1. Functional Requirements

- Generate or retrieve a **stable anonymous UUID** per visitor.
- Expose endpoints:
  - **GET** `/api/userinfo`
  - **GET/POST** `/api/profile`
  - **GET** `/api/credits`
  - **POST** `/api/credits/daily-award`
- Serve a static `storage.html` at `/storage.html` that implements the
  postMessage↔localStorage protocol.
- Provide a JS SDK that:
  1. Reads/writes a first-party cookie `anon_id`.
  2. Falls back to iframe/localStorage if cookie missing.
  3. Attaches `X-Anon-Id` header on all API calls.

### 3.2. Non-Functional Requirements

- **Tech Stack**: Deno (stand-alone, no heavy framework; Oak recommended).
- **Persistence**: PostgreSQL (or any SQL) for profiles & credits.
- **Performance**: <100 ms API response times.
- **Scalability**: Stateless service behind load-balancer.
- **Security**: Secure cookies, CORS, input validation.

---

## 4. Architecture Overview

### 4.1. High-Level Components

- **profile.jinxcodes.ai** (Deno service)
  - HTTP server (Oak)
  - RESTful routes → handlers → Postgres
  - Static asset `storage.html`
- **PostgreSQL**
  - Tables: `users`, `credits`, `ledger`
- **Client SDK**
  - Provides `getAnonId()`, API wrappers, iframe loader

### 4.2. Data Flow

1. **App** loads & calls `SDK.getAnonId()`.
2. **SDK** tries cookie → if missing, loads hidden iframe → postMessage GET.
3. **Iframe** (`storage.html`) reads/writes localStorage & responds.
4. **SDK** hydrates cookie & returns UUID.
5. **App** uses `SDK.api.fetch("GET", "/userinfo")` → sends `X-Anon-Id: <uuid>`.
6. **profile** service reads header or cookie, looks up/creates user record →
   returns JSON.

---

## 5. API Design

All endpoints are under `https://profile.jinxcodes.ai/api`.

### 5.1. Authentication & Session

- **Cookie**:
  `anon_id=<UUID>; Domain=.jinxcodes.ai; Path=/; Secure; SameSite=Lax`
- **Header**: `X-Anon-Id: <UUID>` (fallback if cookie not sent)

### 5.2. Profile Endpoints

| Method | Path        | Description                  | Body / Query                               |
| ------ | ----------- | ---------------------------- | ------------------------------------------ |
| GET    | `/userinfo` | Get current user/profile     | Header or cookie `anon_id`                 |
| GET    | `/profile`  | Alias for `/userinfo`        | —                                          |
| POST   | `/profile`  | Create/update profile fields | `{ name?: string, avatarUrl?: string, … }` |

**Response** (200 OK):

```json
{
  "anonId": "UUID",
  "userId": "UUID|null",
  "name": "string|null",
  "avatarUrl": "string|null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### 5.3. Credits Endpoints

| Method | Path                   | Description                  | Body                                 |
| ------ | ---------------------- | ---------------------------- | ------------------------------------ |
| GET    | `/credits`             | Get current balance & ledger | Header/cookie `anon_id`              |
| POST   | `/credits/daily-award` | Award daily bonus if due     | `{ }`                                |
| POST   | `/credits/adjust`      | Admin adjust credits         | `{ amount: number, reason: string }` |

**Response** (200 OK):

```json
{
  "balance": 123,
  "ledger": [
    { "id": "...", "amount": 10, "type": "daily_bonus", "ts": "ISO8601" },
    …
  ]
}
```

---

## 6. Data Model

```sql
-- users table  
CREATE TABLE users (
  anon_id    UUID PRIMARY KEY,
  user_id    UUID UNIQUE NULL,
  name       TEXT NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- credits table  
CREATE TABLE credits (
  anon_id    UUID PRIMARY KEY REFERENCES users(anon_id),
  balance    INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ledger of credit events  
CREATE TABLE credit_ledger (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id    UUID REFERENCES users(anon_id),
  amount     INTEGER NOT NULL,
  type       TEXT NOT NULL,      -- e.g. "daily_bonus","spend","adjust"
  reason     TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 7. Client SDK

### 7.1. Responsibilities

- Manage `anon_id` persistence (cookie + iframe fallback).
- Expose a promise-based `getAnonId()` initializer.
- Wrap `fetch()` for all `/api/*` calls, auto-injecting `X-Anon-Id`.

### 7.2. Public API

```ts
// sdk.ts
/**
 * Initializes & returns the stable anon ID.
 */
export async function getAnonId(): Promise<string>;

/**
 * Performs an authenticated API call.
 */
export async function callApi<T>(
  method: "GET" | "POST",
  path: string,
  body?: any,
): Promise<T>;
```

### 7.3. Iframe Storage Protocol

1. Serve `storage.html` at root:
   - Listens for `postMessage({ type, key, value })`.
   - On `get`: `localStorage.getItem(key)` → respond.
   - On `set`/`backup`: `localStorage.setItem(key,value)`.
2. SDK loads iframe only on cookie‐miss & falls back or times out (e.g. 500 ms).

---

## 8. Security Considerations

- **Cookies**: Secure, SameSite=Lax, Domain=.jinxcodes.ai
- **CORS**: Allow `https://*.jinxcodes.ai` for API & iframe
- **Input Validation**: sanitize all incoming JSON
- **Rate Limiting**: protect `/credits/daily-award` endpoint
- **CSRF**: relying on SameSite cookies; API also respects `X-Anon-Id` header
- **HTTPS**: terminate TLS at proxy (e.g. Cloudflare, NGINX)

---

## 9. Deployment & Operations

- **Container**: Deno Docker image (`docker run denoland/deno:alpine …`)
- **Reverse Proxy**: NGINX or Cloudflare to handle TLS & subdomain routing
- **Environment**:
  - `DATABASE_URL` (Postgres)
  - `PORT` (e.g. 443)
- **Monitoring**: health endpoint (`/api/healthz`), logs (stdout → ELK)
- **CI/CD**: GitHub Actions to lint, test, build & deploy to staging/production

---

## 10. Future Roadmap

1. **OIDC Support**—add `/authorize`, `/token`, `/userinfo` for real login
   flows.
2. **Split Services**—break profile, credits, auth into separate backends behind
   the same gateway.
3. **Redis Cache**—front `users` lookups for hot paths.
4. **Webhooks & Events**—emit events on signup, credit changes.
5. **Analytics**—track anonymous user journeys (GDPR-compliant).
6. **Multi-region**—deploy replicas for geo performance.

---

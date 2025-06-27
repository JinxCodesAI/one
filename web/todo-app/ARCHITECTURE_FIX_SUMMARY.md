# Todo App Architecture Fix Summary

## 🎯 **Issue Identified**

The original BFF implementation incorrectly used **client-side only** Profile Service SDK methods on the server-side, which caused runtime errors due to browser API dependencies.

### **Root Cause**
- **Profile Service SDK** (`getAnonId()`, `getUserInfo()`, etc.) are **client-side only**
- They depend on browser APIs: `document.cookie`, `document.createElement()`, `window.addEventListener()`
- **BFF server** tried to call these methods, causing "Document not available" errors

### **Evidence**
```typescript
// ❌ PROBLEMATIC - Server-side usage of client-only SDK
const profileClient = createProfileClient({...});
await profileClient.getAnonId(); // Fails on server - needs document.cookie
```

## 🔧 **Solution Implemented**

### **1. Updated BFF Server Architecture**

**Before (Incorrect):**
```
[BFF Server] → [Profile SDK] → [Browser APIs] ❌ FAILS
```

**After (Correct):**
```
[Frontend] → [Profile SDK] → [Browser APIs] ✅ Works
     ↓
[Sends anonId via headers]
     ↓
[BFF Server] → [Direct HTTP calls] → [Profile Service API] ✅ Works
```

### **2. Key Changes Made**

#### **BFF Server (`server/api/profile.ts`)**
- ✅ **Removed** client SDK usage
- ✅ **Added** direct HTTP calls to Profile Service API
- ✅ **Added** `X-Anon-Id` header requirement
- ✅ **Added** proper error handling for each endpoint

#### **Frontend Service (`src/services/profileService.ts`)**
- ✅ **Added** client SDK for anonId generation
- ✅ **Modified** to pass anonId via `X-Anon-Id` header to BFF
- ✅ **Maintained** same public interface for components

#### **SDK Documentation**
- ✅ **Profile SDK**: Added clear "CLIENT-SIDE ONLY" warnings
- ✅ **AI SDK**: Added "UNIVERSAL" usage documentation

## 📊 **API Endpoint Mapping**

| BFF Endpoint | Profile Service API | Method | Auth |
|--------------|-------------------|---------|------|
| `GET /api/profile/anon-id` | **DEPRECATED** | - | - |
| `GET /api/profile/user-info` | `GET /api/userinfo` | Direct HTTP | X-Anon-Id |
| `POST /api/profile/update-profile` | `POST /api/profile` | Direct HTTP | X-Anon-Id |
| `GET /api/profile/credits` | `GET /api/credits` | Direct HTTP | X-Anon-Id |
| `POST /api/profile/claim-daily-bonus` | `POST /api/credits/daily-award` | Direct HTTP | X-Anon-Id |
| `POST /api/profile/spend-credits` | `POST /api/credits/adjust` | Direct HTTP | X-Anon-Id |

## 🔒 **Security & Architecture Benefits**

### **Correct Separation of Concerns**
- **Frontend**: Handles anonId generation using browser APIs
- **BFF**: Proxies authenticated requests to internal services
- **Profile Service**: Receives anonId via headers, not cookies

### **Improved Security**
- ✅ No server-side cookie manipulation
- ✅ Explicit authentication via headers
- ✅ Clear request validation

### **Better Error Handling**
- ✅ Proper HTTP status codes
- ✅ Detailed error messages
- ✅ Graceful fallbacks

## 🧪 **Testing Updates**

### **Fixed Test Issues**
- ✅ **BFF Integration Tests**: Now test endpoints directly instead of SDK
- ✅ **Server Tests**: Use mock routes instead of real SDK imports
- ✅ **Error Handling**: Proper error message assertions

### **Test Results**
```
✅ 56 tests passed, 0 failed
✅ All unit, integration, and E2E tests passing
✅ No browser API dependencies in server tests
```

## 📚 **SDK Usage Guidelines**

### **Profile Service SDK**
```typescript
// ✅ CORRECT - Frontend only
import { getProfileClient } from "@one/profile-service";
const client = getProfileClient();
const anonId = await client.getAnonId(); // Works in browser

// ❌ INCORRECT - Server usage
// Don't use Profile SDK in BFF/server code
```

### **AI API SDK**
```typescript
// ✅ CORRECT - Universal usage
import { createSimpleClient } from "@one/ai-api";

// Frontend
const client = createSimpleClient('https://ai-api.example.com');

// Server/BFF
const client = createSimpleClient('http://localhost:8000');
```

## 🚀 **Next Steps**

1. **Frontend Integration**: Update components to handle anonId properly
2. **Error Handling**: Add user-friendly error messages for auth failures
3. **Monitoring**: Add logging for BFF → Profile Service communication
4. **Documentation**: Update API documentation with header requirements

## ✅ **Verification**

The architecture fix has been verified through:
- ✅ **All tests passing** (56/56)
- ✅ **No browser API calls** in server code
- ✅ **Proper error handling** for missing anonId
- ✅ **Clear SDK documentation** with usage guidelines
- ✅ **Correct HTTP status codes** and error responses

The todo-app now follows the correct co-located BFF pattern with proper separation between client-side and server-side responsibilities.

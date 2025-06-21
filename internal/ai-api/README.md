# AI API Service

A unified AI API service built with Deno that provides both SDK and HTTP interfaces for interacting with multiple AI providers (OpenAI, Anthropic) without managing provider-specific details.

## Features

- **Unified Interface**: Single API for multiple AI providers
- **SDK Integration**: Deno-compatible SDK for direct integration
- **HTTP API**: RESTful endpoints for any language/platform
- **Model Abstraction**: Friendly model names mapped to provider-specific identifiers
- **Configuration Management**: Environment variable-based configuration
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Graceful error handling with meaningful messages
- **Health Checks**: Built-in health monitoring endpoints

## Quick Start

### 1. Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 2. Start the Server

```bash
deno task start
```

The server will start on `http://localhost:8000` by default.

### 3. Using the SDK

```typescript
import { createSimpleClient } from "@scope/ai-api/client";

// Create client with default URL (http://localhost:8000)
const client = createSimpleClient();

// Or specify a custom URL
// const client = createSimpleClient("http://localhost:8000");

const response = await client.generateText({
  messages: [
    { role: "user", content: "Hello, how are you?" }
  ],
  model: "gpt-4o"
});

console.log(response.content);
```

### 4. Using the HTTP API

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "model": "gpt-4o"
  }'
```

## API Endpoints

### POST /generate

Generate text using AI models.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Your message here"}
  ],
  "model": "gpt-3.5-turbo",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Generated response",
    "model": "gpt-4o",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 15,
      "totalTokens": 25
    }
  }
}
```

### GET /models

Get available models.

**Response:**
```json
{
  "success": true,
  "data": {
    "models": ["gpt-3.5-turbo", "gpt-4", "claude-3-haiku"]
  }
}
```

### GET /health

Check service health.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "models": ["gpt-3.5-turbo", "gpt-4"],
    "version": "0.0.1"
  }
}
```

## Available Models

The service provides friendly model names that map to provider-specific identifiers:

**OpenAI Models:**
- `gpt-4.1-nano` → OpenAI GPT-4.1 Nano (default)
- `gpt-4.1-mini` → OpenAI GPT-4.1 Mini
- `gpt-4.1` → OpenAI GPT-4.1
- `gpt-4o` → OpenAI GPT-4o

**Google Models:**
- `gemini-2.5-flash-lite` → Google Gemini 2.5 Flash Lite
- `gemini-2.5-flash` → Google Gemini 2.5 Flash
- `gemini-2.5-pro` → Google Gemini 2.5 Pro

**Anthropic Models (via OpenRouter):**
- `anthropic/claude-3.5-sonnet` → Anthropic Claude 3.5 Sonnet
- `anthropic/claude-3.5-haiku` → Anthropic Claude 3.5 Haiku

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `8000` |
| `HOST` | Server host | No | `0.0.0.0` |
| `OPENAI_API_KEY` | OpenAI API key | Yes* | - |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API key | Yes* | - |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes* | - |
| `AI_DEFAULT_MODEL` | Default model name | No | `gpt-4.1-nano` |

*At least one provider API key is required.

### Custom Model Mappings

You can define custom model mappings using the `AI_MODELS` environment variable:

```env
AI_MODELS='[{"name":"my-gpt","provider":"openai","modelId":"gpt-4","isDefault":false}]'
```

## Development

### Running Tests

```bash
deno task test
```

### Development Mode

```bash
deno task dev
```

### Project Structure

```
packages/ai-api/
├── main.ts              # Main entry point
├── types.ts             # Type definitions
├── config/
│   ├── config.ts        # Configuration management
│   └── config_test.ts   # Configuration tests
├── core/
│   ├── ai-service.ts    # Core AI service
│   └── ai-service_test.ts
├── server/
│   └── server.ts        # HTTP server
└── sdk/
    ├── client.ts        # SDK client
    └── client_test.ts
```

## Error Handling

The service provides consistent error responses:

```json
{
  "success": false,
  "error": {
    "error": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common error codes:
- `GENERATION_ERROR`: Text generation failed
- `NOT_FOUND`: Endpoint not found
- `INTERNAL_ERROR`: Server error

## License

MIT

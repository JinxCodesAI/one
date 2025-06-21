# AI API Service Specification - Stage 2

## Overview
This document outlines the enhanced functional requirements and architecture for the AI API service built with Deno. This specification represents the mature implementation that provides a unified interface for multiple applications to interact with various AI providers through both SDK and HTTP interfaces.

## Goals
- Create a production-ready centralized AI service that abstracts away provider-specific details
- Provide both SDK and HTTP interfaces for integration with comprehensive error handling
- Support synchronous text generation operations with multiple AI providers
- Implement robust testing infrastructure with E2E testing capabilities
- Enable cross-platform deployment with containerized build processes
- Provide comprehensive configuration management and operational monitoring

## Target Users
- Internal development teams building applications that require AI capabilities
- Services that need to integrate AI functionality without managing provider relationships
- DevOps teams requiring reliable deployment and monitoring capabilities
- QA teams needing comprehensive testing infrastructure

## Functional Requirements

### Core Functionality
1. **Multi-Provider Text Generation**
   - Accept text generation requests with messages in conversation format
   - Support OpenAI, Google Gemini, and Anthropic (via OpenRouter) providers
   - Use friendly model names mapped to provider-specific identifiers
   - Return generated text responses with usage statistics
   - Handle errors gracefully with structured error responses

2. **Model Management**
   - Provide predefined model mappings for common AI models
   - Support custom model configurations via environment variables
   - Automatic model availability based on configured providers
   - Default model fallback when specific models aren't available

### Integration Methods
1. **Enhanced SDK Integration**
   - Provide multiple client creation methods (`createClient`, `createSimpleClient`)
   - Support request timeout handling with AbortController
   - Implement comprehensive error handling with network error detection
   - Export modular components for different use cases

2. **Production HTTP API**
   - Expose RESTful endpoints with standardized response format
   - Implement CORS support for cross-origin requests
   - Use structured `ApiResponse<T>` wrapper for all responses
   - Provide detailed error responses with error codes and HTTP status mapping

3. **Operational Endpoints**
   - Health check endpoint with service status and available models
   - Models listing endpoint for dynamic model discovery
   - Version information in health responses

### Configuration Management
1. **Environment-Based Configuration**
   - Support multiple provider API keys with automatic provider filtering
   - Provider-specific configuration (OpenAI, Google, OpenRouter)
   - Custom model mappings via `AI_MODELS` environment variable
   - Configuration validation with detailed error messages

2. **Runtime Configuration**
   - Configuration summary printing (without sensitive data)
   - Automatic default model selection based on available providers
   - Support for custom base URLs per provider

### Testing Infrastructure
1. **Comprehensive E2E Testing**
   - BDD-style test structure using `@std/testing/bdd`
   - Fetch mocking infrastructure for external API testing
   - Provider-specific test scenarios with customizable responses
   - Shared testing infrastructure package for reusability

2. **Test Organization**
   - Separate E2E test directory with auto-discovery
   - Basic provider tests, advanced scenarios, and custom model tests
   - Error handling and edge case testing

## Technical Architecture

### Enhanced Components
1. **Core AI Service**
   - Uses `npm:ai@^4.3.16` as the primary AI library
   - Provider-specific packages: `@ai-sdk/openai`, `@ai-sdk/google`, `@openrouter/ai-sdk-provider`
   - Comprehensive request validation with detailed error messages
   - Provider client management with initialization error handling

2. **Production HTTP Server**
   - Built on Deno's native `Deno.serve()` API
   - Structured request routing with proper HTTP method handling
   - CORS middleware for cross-origin support
   - Graceful shutdown handling with platform-specific signal management

3. **Advanced SDK Client**
   - Request timeout handling with configurable timeouts
   - Network error detection and meaningful error messages
   - Multiple response parsing strategies
   - Modular export structure for different integration patterns

4. **Comprehensive Type System**
   - Shared types across all components with detailed interfaces
   - API response wrappers with success/error discrimination
   - Configuration types with validation support
   - Health check and operational response types

### Data Flow Enhancement
1. **Request Processing Pipeline**
   - Request validation → Model mapping → Provider selection → API call → Response formatting
   - Error handling at each stage with appropriate HTTP status codes
   - Usage statistics collection and formatting
   - Provider-specific response transformation

2. **Configuration Loading**
   - Environment variable loading with `.env` file support
   - Provider availability detection and filtering
   - Model availability validation against configured providers
   - Default model selection with fallback logic

## Deployment Architecture

### Cross-Platform Build System
1. **Docker-Based Compilation**
   - Cross-compilation support for Linux deployment from Windows
   - Containerized build process using Deno 2.3.6
   - PowerShell automation scripts for Windows development
   - Binary extraction and cleanup automation

2. **Production Deployment**
   - Systemd service configuration templates
   - Environment variable management for production
   - Binary deployment with proper permissions
   - Service monitoring and restart capabilities

### Operational Features
1. **Service Management**
   - Graceful shutdown with signal handling (SIGINT, SIGTERM)
   - Platform-specific signal management (Windows vs Unix)
   - Health monitoring with detailed status reporting
   - Version tracking in operational responses

2. **Development Support**
   - Hot reload development mode
   - Comprehensive test suites with watch mode
   - Separate E2E test execution
   - Development and production build targets

## Model Specifications

### Supported Models
1. **OpenAI Models**
   - `gpt-4.1-nano` (default) → `gpt-4.1-nano`
   - `gpt-4.1-mini` → `gpt-4.1-mini`
   - `gpt-4.1` → `gpt-4.1`
   - `gpt-4o` → `gpt-4o`

2. **Google Models**
   - `gemini-2.5-flash-lite` → `gemini-2.5-flash-lite-preview-06-17`
   - `gemini-2.5-flash` → `gemini-2.5-flash`
   - `gemini-2.5-pro` → `gemini-2.5-pro`

3. **Anthropic Models (via OpenRouter)**
   - `anthropic/claude-3.5-sonnet` → `anthropic/claude-3.5-sonnet`
   - `anthropic/claude-3.5-haiku` → `anthropic/claude-3.5-haiku`

## API Specifications

### Enhanced Endpoints
1. **POST /generate**
   - Structured request validation with detailed error messages
   - Support for `maxTokens` and `temperature` parameters
   - Usage statistics in response with token counts
   - Provider-specific response formatting

2. **GET /models**
   - Dynamic model list based on configured providers
   - Filtered model availability
   - Structured response format

3. **GET /health**
   - Service status with provider health checking
   - Available models listing
   - Version information
   - Timestamp for monitoring

## Implementation Considerations

### Technology Stack
- **Runtime**: Deno 2.3.6
- **AI Integration**: npm:ai@^4.3.16 with provider-specific packages
- **HTTP Server**: Deno's built-in `Deno.serve()` API
- **Testing**: @std/testing/bdd with custom E2E infrastructure
- **Build**: Docker-based cross-compilation

### Performance and Reliability
- Request timeout handling with AbortController
- Provider-specific error handling and retry logic
- Configuration validation at startup
- Comprehensive logging for debugging and monitoring

### Security Considerations
- API key management through environment variables
- CORS configuration for controlled access
- Input validation and sanitization
- Error message sanitization to prevent information leakage

## Development Process
- Test-driven development with comprehensive E2E testing
- Modular architecture with clear separation of concerns
- Comprehensive documentation for SDK usage and HTTP endpoints
- Version control with semantic versioning
- Automated build and deployment processes

## Future Expansion Roadmap
- Asynchronous processing capabilities with job queues
- Additional AI capabilities (image generation, embeddings, audio transcription)
- Advanced features (request caching, rate limiting, usage analytics)
- Connection pooling and request batching optimizations
- Monitoring and alerting integration

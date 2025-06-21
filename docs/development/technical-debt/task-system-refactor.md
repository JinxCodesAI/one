# Task System Refactor - Technical Debt Document

## Status
**Proposed** - June 2025

## Overview

This document outlines technical debt issues in the current Deno task system across the One monorepo and proposes a comprehensive refactor to improve consistency, maintainability, and developer experience.

## Current State Analysis

### Issues Identified

#### 1. Inconsistent Task Naming
- **Root level**: Uses `test:ai-api`, `test:ai-chat` pattern
- **Project level**: Uses `test`, `test:unit`, `test:e2e` pattern
- **Inconsistency**: Some tasks use colons, others use hyphens
- **Impact**: Confusing for developers, hard to remember patterns

#### 2. Redundant Task Definitions
- **Root deno.json**: Defines project-specific tasks that delegate to project tasks
- **Project deno.json**: Defines the actual implementation
- **Problem**: Double maintenance, potential for drift between definitions
- **Example**: `test:ai-api` in root calls `test` and `test:e2e` in ai-api project

#### 3. Inconsistent Permission Flags
- **ai-api dev**: `--allow-net --allow-env --allow-read --watch`
- **ai-chat dev**: `-A --node-modules-dir`
- **ai-api test**: `--allow-net --allow-env`
- **ai-chat test**: `--allow-net --allow-env --allow-read --allow-write`
- **Impact**: Security inconsistencies, maintenance overhead

#### 4. Missing Standardized Patterns
- No consistent pattern for:
  - Build tasks across projects
  - Deployment preparation
  - Environment-specific configurations
  - Cleanup tasks
  - Linting and formatting

#### 5. Complex Task Dependencies
- **Root test tasks**: Chain multiple project tasks with `&&`
- **Error handling**: If one project fails, subsequent projects don't run
- **Feedback**: Poor error reporting for which specific project failed

#### 6. Missing Production Workflows
- No standardized build pipeline
- No deployment preparation tasks
- No environment validation tasks
- No production health checks

## Proposed Solution

### 1. Standardized Task Naming Convention

```json
{
  "tasks": {
    // Development
    "dev": "Start development server",
    "dev:watch": "Start development server with file watching",
    "dev:debug": "Start development server with debugging",
    
    // Building
    "build": "Build for production",
    "build:dev": "Build for development",
    "build:watch": "Build with file watching",
    
    // Testing
    "test": "Run all tests",
    "test:unit": "Run unit tests only",
    "test:integration": "Run integration tests only", 
    "test:e2e": "Run end-to-end tests only",
    "test:watch": "Run tests in watch mode",
    "test:coverage": "Run tests with coverage",
    
    // Quality
    "lint": "Run linter",
    "lint:fix": "Run linter with auto-fix",
    "format": "Format code",
    "format:check": "Check code formatting",
    "typecheck": "Run type checking",
    
    // Deployment
    "deploy:prepare": "Prepare for deployment",
    "deploy:build": "Build for deployment",
    "deploy:validate": "Validate deployment readiness",
    
    // Utilities
    "clean": "Clean build artifacts",
    "reset": "Reset to clean state",
    "health": "Check service health"
  }
}
```

### 2. Centralized Task Management

Create a task management system that:
- Validates task configurations
- Provides consistent error handling
- Manages task dependencies
- Offers parallel execution where appropriate
- Provides detailed logging and feedback

### 3. Permission Standardization

Define standard permission sets:
- **Basic**: `--allow-net --allow-env --allow-read`
- **Development**: `--allow-net --allow-env --allow-read --allow-write --watch`
- **Testing**: `--allow-net --allow-env --allow-read --allow-write --allow-run --allow-sys`
- **All**: `-A` (only when necessary)

### 4. Enhanced Root Task Orchestration

Replace simple `&&` chaining with intelligent task runner that:
- Runs tasks in parallel where possible
- Provides clear progress indication
- Continues on failure with proper reporting
- Aggregates results across projects

## Implementation Plan

### Phase 1: Foundation
1. Create technical debt document ✓
2. Create centralized task runner utility
3. Standardize permission sets
4. Update root-level task definitions

### Phase 2: Project Standardization
1. Update ai-api task definitions
2. Update ai-chat task definitions
3. Update testing-infrastructure task definitions
4. Ensure consistency across all projects

### Phase 3: Enhanced Features
1. Add missing build and deployment tasks
2. Implement parallel task execution
3. Add task validation and error handling
4. Create comprehensive task documentation

### Phase 4: Testing and Validation
1. Create comprehensive tests for task system
2. Run full E2E test suite
3. Validate all existing workflows still work
4. Performance testing of new task runner

## Benefits

### Developer Experience
- **Consistent**: Same task names work across all projects
- **Predictable**: Standard patterns for common operations
- **Efficient**: Parallel execution where possible
- **Clear**: Better error messages and progress indication

### Maintainability
- **DRY**: Eliminate redundant task definitions
- **Centralized**: Single source of truth for task patterns
- **Validated**: Automatic validation of task configurations
- **Documented**: Clear documentation of all available tasks

### Production Readiness
- **Complete**: Full build and deployment pipeline
- **Reliable**: Proper error handling and validation
- **Monitored**: Health checks and validation tasks
- **Secure**: Consistent and minimal permission sets

## Migration Strategy

### Backward Compatibility
- Keep existing task names during transition
- Add deprecation warnings for old patterns
- Provide migration guide for developers

### Rollout Plan
1. **Week 1**: Implement new task runner and update root tasks
2. **Week 2**: Update ai-api project tasks
3. **Week 3**: Update ai-chat project tasks
4. **Week 4**: Update testing-infrastructure and finalize
5. **Week 5**: Remove deprecated tasks and update documentation

## Success Metrics

- **Consistency**: All projects use same task naming patterns
- **Performance**: Task execution time improved by 20%
- **Reliability**: Zero task failures due to configuration issues
- **Developer Satisfaction**: Positive feedback on new task system
- **Test Coverage**: 100% test coverage for task system functionality

## Risks and Mitigation

### Risk: Breaking Existing Workflows
- **Mitigation**: Maintain backward compatibility during transition
- **Mitigation**: Comprehensive testing before rollout

### Risk: Developer Resistance
- **Mitigation**: Clear communication of benefits
- **Mitigation**: Gradual rollout with training

### Risk: Increased Complexity
- **Mitigation**: Keep task runner simple and well-documented
- **Mitigation**: Provide fallback to simple task execution

## Next Steps

1. **Approve this technical debt document**
2. **Begin implementation of Phase 1**
3. **Create detailed implementation tickets**
4. **Set up monitoring for task system performance**
5. **Plan developer communication and training**

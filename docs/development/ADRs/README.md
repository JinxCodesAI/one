# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) that document important architectural and technical decisions made for this project.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made along with their context and consequences. They help teams understand why certain decisions were made and provide guidance for future development.

## Current ADRs

### Development & Infrastructure

1. **[Adding New Projects to Monorepo](./Adding_New_Projects_to_Monorepo.md)**
   - **Status**: Active
   - **Summary**: Comprehensive guide for adding new projects to the monorepo with proper integration into the `just`-based task system
   - **Key Points**: Step-by-step process, workspace configuration, testing integration, documentation updates

2. **[Docker Compose Strategy](./Docker_Compose_Strategy.md)**
   - **Status**: Proposed
   - **Summary**: Evaluation and implementation plan for Docker Compose in development and production environments
   - **Key Points**: Native vs containerized development, implementation phases, migration strategy

### Testing

3. **[Testing Guide Comprehensive](./Testing_Guide_Comprehensive.md)**
   - **Status**: Active
   - **Summary**: Comprehensive testing strategy including unit tests, integration tests, and E2E tests
   - **Key Points**: BDD-style testing, shared testing infrastructure, E2E testing with browser automation

4. **[E2E Testing Guide](./E2E_Testing_Guide.md)**
   - **Status**: Active
   - **Summary**: Detailed guide for implementing end-to-end tests across the monorepo
   - **Key Points**: Browser automation, fetch mocking, UI interaction testing, shared testing utilities

## ADR Template

When creating new ADRs, use this template:

```markdown
# ADR: [Title]

**Status**: [Proposed | Active | Deprecated | Superseded]  
**Date**: YYYY-MM-DD  
**Authors**: [Author names]  
**Reviewers**: [Reviewer names]  

## Context
[Describe the context and problem statement]

## Decision
[Describe the decision made]

## Implementation
[Describe how the decision will be implemented]

## Consequences
[Describe the positive and negative consequences]

## Alternatives Considered
[List alternatives that were considered]

## Related Documents
[Link to related ADRs, specifications, or documentation]
```

## ADR Lifecycle

1. **Proposed**: ADR is written and under review
2. **Active**: ADR is approved and being implemented/followed
3. **Deprecated**: ADR is no longer relevant but kept for historical context
4. **Superseded**: ADR has been replaced by a newer ADR

## Guidelines

### When to Create an ADR

- Architectural decisions that affect multiple components
- Technology choices (frameworks, libraries, tools)
- Development process changes
- Infrastructure decisions
- Security-related decisions
- Performance-related decisions

### ADR Best Practices

1. **Be Specific**: Focus on one decision per ADR
2. **Include Context**: Explain why the decision was needed
3. **Document Alternatives**: Show what options were considered
4. **Update Status**: Keep the status current as decisions evolve
5. **Link Related ADRs**: Reference related decisions
6. **Use Clear Language**: Write for future team members

## Implementation Status

| ADR | Status | Implementation | Notes |
|-----|--------|----------------|-------|
| Adding New Projects | Active | ✅ Complete | Integrated with justfile system |
| Docker Compose Strategy | Proposed | 🚧 Partial | Basic setup created, full implementation pending |
| Testing Guide | Active | ✅ Complete | Comprehensive testing infrastructure in place |
| E2E Testing Guide | Active | ✅ Complete | Browser automation and mocking implemented |

## Related Documentation

- [Development Guide](../../DEVELOPMENT.md)
- [Testing Guide](../../TESTING.md)
- [Technical Debt](../technical-debt/)
- [AI API Specifications](../ai-api/)

## Contributing

When making significant architectural decisions:

1. Create a new ADR using the template above
2. Discuss with the team during architecture reviews
3. Update the status as the decision progresses
4. Link to the ADR from relevant documentation
5. Update this README with the new ADR

## Questions?

For questions about ADRs or architectural decisions, please:
- Review existing ADRs for similar decisions
- Discuss in team architecture meetings
- Create GitHub issues for clarification
- Update ADRs when decisions evolve

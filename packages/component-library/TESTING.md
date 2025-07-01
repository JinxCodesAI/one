# Component Library Testing Guide

This document provides comprehensive information about the testing infrastructure and practices for the component library, following the [Comprehensive Testing Guide](../../docs/development/ADRs/Testing_Guide_Comprehensive.md).

## 🎯 Testing Philosophy

Our testing approach follows a multi-layered strategy ensuring:
- **Functionality**: Components work as expected
- **Accessibility**: WCAG 2.1 AA compliance
- **Visual Consistency**: Cross-browser and responsive behavior
- **Performance**: Optimal rendering and memory usage
- **Integration**: Real-world usage scenarios

## 📋 Test Types Overview

### 1. Unit Tests
**Purpose**: Test individual component functionality
**Coverage**: All 9 components with comprehensive test suites
**Location**: `src/*/**.test.tsx` files alongside components

**What we test**:
- All prop combinations and variants
- State changes and event handling
- Edge cases and error conditions
- Component lifecycle behavior

### 2. Accessibility Tests
**Purpose**: Ensure WCAG 2.1 AA compliance
**Coverage**: All interactive components
**Location**: `src/*/**.accessibility.test.tsx` files

**What we test**:
- Keyboard navigation support
- Screen reader compatibility
- ARIA attributes and relationships
- Focus management
- Color contrast compliance
- Mobile accessibility

### 3. Visual Regression Tests
**Purpose**: Maintain visual consistency
**Coverage**: All visual variants and states
**Location**: `src/*/**.visual.test.tsx` files

**What we test**:
- Component appearance across sizes
- Layout integrity with varying content
- Responsive behavior
- Cross-browser consistency
- Animation and transition states

### 4. Performance Tests
**Purpose**: Ensure optimal performance
**Coverage**: Render timing and memory usage
**Location**: Integrated within comprehensive test suites

**What we test**:
- Component render time
- Memory usage patterns
- State change performance
- Large dataset handling

### 5. Integration Tests
**Purpose**: Test real-world scenarios
**Coverage**: Complete user workflows
**Location**: `tests/integration/` directory

**What we test**:
- Form submission workflows
- Modal interactions
- Multi-component scenarios
- Data flow between components

## 🚀 Running Tests

### Quick Start
```bash
# Run all tests
deno task test

# Run specific test types
deno task test:unit
deno task test:accessibility
deno task test:visual
deno task test:performance
deno task test:integration

# Development workflow
deno task test:watch
deno task test:verbose
```

### Test Commands Reference

| Command | Description |
|---------|-------------|
| `deno task test` | Run comprehensive test suite |
| `deno task test:unit` | Unit tests only |
| `deno task test:accessibility` | Accessibility compliance tests |
| `deno task test:visual` | Visual regression tests |
| `deno task test:performance` | Performance benchmarks |
| `deno task test:integration` | Integration scenarios |
| `deno task test:coverage` | Generate coverage report |
| `deno task test:verbose` | Verbose output with details |
| `deno task test:watch` | Watch mode for development |

## 🔧 Test Infrastructure

### Custom Test Utilities

#### ComponentTestUtils
```typescript
// Mock component creation
const button = ComponentTestUtils.createMockProps<ButtonProps>({
  variant: "primary",
  children: "Test Button"
});

// Event simulation
ComponentTestUtils.simulateEvent("click", button, { ctrlKey: true });
```

#### AccessibilityTestUtils
```typescript
// ARIA attribute validation
const ariaResults = AccessibilityTestUtils.checkAriaAttributes(element, {
  "aria-label": "Expected label",
  "aria-describedby": "description-id"
});

// Keyboard navigation testing
const keyboardResults = AccessibilityTestUtils.checkKeyboardNavigation(element, [
  "Enter", "Space", "Tab", "Escape"
]);
```

#### VisualTestUtils
```typescript
// Visual snapshot capture
const snapshot = VisualTestUtils.captureComponentSnapshot(Component, props);

// Snapshot comparison
const comparison = VisualTestUtils.compareSnapshots(snapshot1, snapshot2);
```

#### PerformanceTestUtils
```typescript
// Render time measurement
const { renderTime } = PerformanceTestUtils.measureRenderTime(() => {
  return createComponent(props);
});

// Memory usage tracking
const { delta } = PerformanceTestUtils.measureMemoryUsage(() => {
  // Test operations
});
```

## 📊 Test Coverage Standards

### Coverage Targets
- **Components**: 100% (all components tested)
- **Functions**: 95%+ function coverage
- **Lines**: 90%+ line coverage
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Visual**: All variants, sizes, and states
- **Performance**: All components benchmarked

### Coverage Reporting
```bash
# Generate coverage report
deno task test:coverage

# View coverage details
open coverage/html/index.html
```

## 🎯 Writing Tests

### Unit Test Example
```typescript
describe("Button Component", () => {
  it("should render with correct variant", () => {
    const button = createButton({ 
      variant: "primary", 
      children: "Test" 
    });
    
    assertEquals(button.variant, "primary");
    assertEquals(button.children, "Test");
  });

  it("should handle click events", () => {
    let clicked = false;
    const button = createButton({ 
      children: "Click me",
      onClick: () => { clicked = true; }
    });
    
    button.click();
    assertEquals(clicked, true);
  });
});
```

### Accessibility Test Example
```typescript
describe("Input Accessibility", () => {
  it("should support keyboard navigation", () => {
    const input = createInput({ placeholder: "Test input" });
    
    const keyboardResults = AccessibilityTestUtils.checkKeyboardNavigation(input, [
      "Tab", "Enter", "Escape"
    ]);
    
    const tabResult = keyboardResults.find(r => r.key === "Tab");
    assertExists(tabResult);
  });

  it("should have proper ARIA attributes", () => {
    const input = createInput({ 
      "aria-label": "Search input",
      "aria-required": "true"
    });
    
    assertEquals(input.getAttribute("aria-label"), "Search input");
    assertEquals(input.getAttribute("aria-required"), "true");
  });
});
```

### Integration Test Example
```typescript
describe("Form Workflow", () => {
  it("should handle complete form submission", () => {
    // Setup form components
    const modal = createModal({ isOpen: true, title: "Create Task" });
    const titleField = createFormField({ 
      label: "Title", 
      required: true,
      children: createInput({ type: "text", fullWidth: true })
    });
    const submitButton = createButton({ variant: "primary" });
    
    // Test form validation
    const errors = validateForm({ title: "" });
    assertEquals(errors.title, "Title is required");
    
    // Test successful submission
    const validData = { title: "Test Task" };
    const validationResult = validateForm(validData);
    assertEquals(Object.keys(validationResult).length, 0);
  });
});
```

## 🔄 Continuous Integration

### Pre-commit Hooks
```bash
# Run before each commit
deno task test:unit
deno task test:accessibility
deno task lint
deno task fmt
```

### Pull Request Pipeline
```bash
# Full test suite for PRs
deno task test
deno task test:coverage
deno task storybook:build
```

### Release Pipeline
```bash
# Comprehensive testing for releases
deno task test
deno task test:performance
deno task storybook:build
# Visual regression testing
# Performance benchmarking
```

## 🐛 Debugging Tests

### Common Issues

1. **Mock Environment**: Ensure DOM and React mocks are properly initialized
2. **Async Operations**: Use proper async/await patterns
3. **Event Simulation**: Verify event handlers are properly attached
4. **ARIA Testing**: Check that ARIA attributes are correctly set

### Debug Commands
```bash
# Verbose test output
deno task test:verbose

# Single test file
deno test src/atoms/Button/Button.test.tsx --allow-read --allow-env

# Debug specific test
deno test --inspect-brk src/atoms/Button/Button.test.tsx --allow-read --allow-env
```

## 📈 Performance Benchmarks

### Render Time Targets
- **Atoms**: < 5ms render time
- **Molecules**: < 15ms render time  
- **Organisms**: < 50ms render time

### Memory Usage Targets
- **Single Component**: < 1MB memory footprint
- **Component Library**: < 10MB total bundle size
- **State Changes**: < 100ms for complex updates

## 🎨 Visual Testing

### Snapshot Testing
Visual regression tests capture component snapshots and compare them across:
- Different prop combinations
- Various screen sizes
- Multiple browser contexts
- Theme variations

### Cross-browser Testing
Tests ensure consistency across:
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers

## 🤝 Contributing Tests

### Test Requirements
1. **New Components**: Must include all test types
2. **Bug Fixes**: Add regression tests
3. **Features**: Update existing tests and add new ones
4. **Accessibility**: Verify WCAG compliance

### Test Review Checklist
- [ ] All test types implemented
- [ ] Coverage targets met
- [ ] Accessibility compliance verified
- [ ] Performance benchmarks within limits
- [ ] Integration scenarios covered
- [ ] Documentation updated

## 📚 Additional Resources

- [Testing Guide](../../docs/development/ADRs/Testing_Guide_Comprehensive.md)
- [Accessibility Guidelines](./docs/accessibility.md)
- [Performance Best Practices](./docs/performance.md)
- [Storybook Documentation](./stories/README.md)

---

This comprehensive testing approach ensures the component library maintains high quality, accessibility, and performance standards while providing confidence for production deployments.

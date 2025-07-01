# Component Extraction Plan v2 - Unified Component Library Strategy

## Overview

This document provides a comprehensive strategy for transitioning from multiple web applications with disparate front-end code (`web/ai-chat` and `web/todo-app`) to a centralized, future-proof component library within our monorepo. The goal is to unify the look and feel of applications, accelerate development, and create a system that is easily leveraged by AI coding assistants.

## Strategic Approach: Atomic Design Principles

Our component library will be structured around **Atomic Design principles**, adapted for practical implementation:

### Core Classifications

* **Atoms ⚛️:** The smallest, indivisible UI elements
  * **Examples:** `Button`, `Input`, `Icon`, `Label`, `Checkbox`, `LoadingSpinner`
  * **Characteristics:** Highly reusable, often stateless, rarely used in isolation
  * **From our audit:** Button variants, Input components, basic loading states

* **Molecules 🧬:** Simple, functional groupings of atoms
  * **Examples:** `SearchForm` (Input + Button), `FormField` (Label + Input + ErrorMessage)
  * **Characteristics:** The workhorses of the library, representing distinct UI patterns
  * **From our audit:** Message input area, form field groups, alert components

* **Organisms 🐒:** Complex components composed of atoms and molecules
  * **Examples:** `Header`, `Modal`, `TodoCard`, `ChatContainer`
  * **Characteristics:** Represent larger, reusable parts of a page
  * **From our audit:** Application headers, modal dialogs, complex cards

**Note:** We intentionally omit *Templates* and *Pages* from the component library, leaving layout composition to individual applications for maximum flexibility.

## Component Library Structure

```
packages/component-library/
├── src/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Icon/
│   │   ├── LoadingSpinner/
│   │   └── index.ts
│   ├── molecules/
│   │   ├── FormField/
│   │   ├── SearchForm/
│   │   ├── Alert/
│   │   └── index.ts
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Modal/
│   │   ├── ChatContainer/
│   │   └── index.ts
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── borders.ts
│   │   └── index.ts
│   ├── hooks/
│   ├── utils/
│   └── index.ts
├── docs/
├── stories/
├── CONTRIBUTING.md
├── deno.json
└── README.md
```

## Design Tokens Foundation

Design tokens are the cornerstone of our flexible and consistent design system. They store visual design attributes as named entities, enabling global style changes and theme variations.

### Unified Color System
```typescript
// packages/component-library/src/tokens/colors.ts
export const colors = {
  // Primary brand colors (unified from audit findings)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  // Unified primary blue
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  
  // Semantic colors (standardized)
  error: {
    50: '#fef2f2',
    100: '#fecaca',
    500: '#ef4444',  // Unified error red
    600: '#dc2626'
  },
  
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    600: '#059669'
  },
  
  // Neutral scale (comprehensive)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  
  // Background variants
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
};
```

### Typography System
```typescript
// packages/component-library/src/tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  }
};
```

### Spacing System (8px Grid)
```typescript
// packages/component-library/src/tokens/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem'     // 80px
};
```

## Migration Plan: Phased Approach

### Phase 1: Audit and Foundation (Weeks 1-2)

#### 1.1 UI Inventory and Analysis ✅
- **Status:** Completed in UI_Audit_Report.md
- **Findings:** Significant inconsistencies in styling approaches, color palettes, and component patterns
- **Key Insights:** Todo App has more mature UI patterns; AI Chat uses inline styles vs CSS classes

#### 1.2 Define Design Tokens
- **Action:** Implement unified design tokens based on audit findings
- **Priority:** Colors (unify primary blues), Typography (consistent scales), Spacing (8px grid)
- **Goal:** Establish foundational visual language before building components

#### 1.3 Setup Monorepo Infrastructure
- **Action:** Initialize `packages/component-library` with proper tooling
- **Requirements:** TypeScript, Storybook, Testing framework, Build system
- **Goal:** Create development environment that encourages documentation-driven development

#### 1.4 Install Essential Tooling
- **Storybook:** Non-negotiable for component development and documentation
- **Testing:** Unit tests for all components
- **Build System:** Support for tree-shaking and optimal bundling
- **Goal:** Create infrastructure that supports both human developers and AI assistants

### Phase 2: Building the Library (Weeks 3-6)

#### 2.1 Start with Atoms (Week 3)
Based on audit findings, prioritize these fundamental components:

**Button Atom**
```typescript
// Unified from both applications' button patterns
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

**Input Atoms**
```typescript
// Combining AI Chat's auto-resize with Todo App's validation
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

interface TextareaProps extends InputProps {
  autoResize?: boolean; // From AI Chat
  maxHeight?: string;
}
```

**LoadingSpinner Atom**
```typescript
// From Todo App with enhancements
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: keyof typeof colors;
}
```

#### 2.2 Document Everything in Storybook
- **Action:** Create `.stories.tsx` for every component
- **Requirements:** Showcase all states, variations, and edge cases
- **Use argTypes:** Document all props with descriptions and controls
- **Goal:** Living documentation that's always up-to-date

#### 2.3 Build Molecules (Week 4)
Compose atoms into functional groupings:

**FormField Molecule**
```typescript
// Combining Label + Input + ErrorMessage atoms
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactElement; // Input atom
}
```

**Alert Molecule**
```typescript
// Unified from both error handling patterns
interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  variant?: 'banner' | 'card' | 'toast';
  title?: string;
  message: string;
  onClose?: () => void;
  onRetry?: () => void; // From AI Chat
}
```

#### 2.4 Build Organisms (Weeks 5-6)
Create complex, reusable interface sections:

**Header Organism**
```typescript
// Flexible header supporting both app patterns
interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  theme?: 'light' | 'dark' | 'glass';
  sticky?: boolean;
}
```

**Modal Organism**
```typescript
// From Todo App with accessibility enhancements
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
```

### Phase 3: Incremental Adoption (Weeks 7-10)

#### 3.1 Choose Pilot Application
- **Recommendation:** Start with Todo App (more mature UI patterns)
- **Target:** Begin with a single page or feature
- **Goal:** Test integration process and gather feedback

#### 3.2 Replace Existing Components
- **Strategy:** Start with atoms, work up to organisms
- **Priority Order:** Button → Input → Card → Modal → Header
- **Approach:** Replace on modification + batch migration of similar components

#### 3.3 Establish Contribution Workflow
- **Create:** Comprehensive `CONTRIBUTING.md`
- **Define:** Process for proposing, developing, and reviewing components
- **Goal:** Empower all developers while maintaining quality

## Future-Proofing Strategies

### Composition Over Configuration
- **Principle:** Favor creating new UI by composing existing components
- **Benefit:** Keeps components simple and flexible
- **Example:** Build complex forms by composing FormField molecules rather than creating monolithic form components

### Theming Support
- **Structure:** Design tokens that can be easily overridden
- **Benefit:** Different applications can have distinct looks while sharing core components
- **Implementation:** CSS custom properties or theme context

### Semantic Versioning
- **Strategy:** Use `major.minor.patch` versioning
- **Communication:** Clear change communication to consuming applications
- **Breaking Changes:** Major version bumps for API changes

### Platform Agnostic Design
- **Principle:** Design component APIs to be framework-agnostic where possible
- **Benefit:** Easier future migrations to other technologies
- **Focus:** Props interface design over implementation details

## Success Metrics

### Technical Metrics
- [ ] 90% reduction in duplicate UI code across applications
- [ ] All new features use shared components
- [ ] Component library has 100% Storybook coverage
- [ ] 95% test coverage for all components

### Developer Experience Metrics
- [ ] 50% faster development of new UI features
- [ ] Consistent design implementation across teams
- [ ] Positive developer feedback on component library usage
- [ ] AI coding assistants can effectively use component documentation

### User Experience Metrics
- [ ] Consistent visual design across all applications
- [ ] Improved accessibility compliance (WCAG 2.1 AA)
- [ ] Better performance through optimized shared components
- [ ] Reduced visual inconsistencies and bugs

## Risk Mitigation

### Technical Risks
- **Breaking Changes:** Maintain backward compatibility during migration
- **Performance Impact:** Monitor bundle sizes and implement tree-shaking
- **Styling Conflicts:** Use CSS-in-JS or CSS Modules for style isolation

### Process Risks
- **Adoption Resistance:** Provide clear migration guides and hands-on support
- **Incomplete Migration:** Set clear deadlines and track migration progress
- **Maintenance Overhead:** Establish clear ownership and governance model

## Next Steps

1. **Week 1:** Set up component library infrastructure and design tokens
2. **Week 2:** Create Storybook setup and establish development workflow
3. **Week 3:** Implement core atoms (Button, Input, LoadingSpinner)
4. **Week 4:** Build essential molecules (FormField, Alert)
5. **Week 5-6:** Create key organisms (Header, Modal)
6. **Week 7-8:** Begin pilot migration with Todo App
7. **Week 9-10:** Expand migration and refine based on feedback

## Detailed Component Implementation Guide

### Atoms Implementation Details

#### Button Component (Priority 1)
**Source Analysis:**
- AI Chat: Inline styled buttons with JavaScript hover effects
- Todo App: CSS class-based buttons with comprehensive variants

**Implementation Strategy:**
```typescript
// packages/component-library/src/atoms/Button/Button.tsx
import { colors, spacing, typography } from '../../tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  children,
  ...props
}: ButtonProps) {
  // Implementation using design tokens
  const baseStyles = {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2]
  };

  // Variant and size-specific styles using design tokens
}
```

**Migration Path:**
1. Extract Todo App's button utility classes as base
2. Add AI Chat's hover interaction patterns
3. Implement loading states with LoadingSpinner atom
4. Create comprehensive Storybook stories

#### Input Components (Priority 1)
**Source Analysis:**
- AI Chat: Basic textarea with auto-resize functionality
- Todo App: Comprehensive input system with validation states

**Implementation Strategy:**
```typescript
// Base Input atom
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

// Textarea atom with auto-resize from AI Chat
interface TextareaProps {
  placeholder?: string;
  error?: string;
  autoResize?: boolean;
  maxHeight?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
}
```

### Molecules Implementation Details

#### FormField Molecule (Priority 2)
**Composition:** Label + Input + ErrorMessage atoms
```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactElement; // Input atom
}
```

#### Alert Molecule (Priority 2)
**Source Analysis:**
- AI Chat: Card-style error with retry/dismiss functionality
- Todo App: Banner-style error with close functionality

**Unified Implementation:**
```typescript
interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  variant?: 'banner' | 'card' | 'toast';
  title?: string;
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
  dismissible?: boolean;
  icon?: React.ReactNode;
}
```

### Organisms Implementation Details

#### Header Organism (Priority 2)
**Source Analysis:**
- AI Chat: Dark header with title and clear button
- Todo App: Glassmorphism header with branding

**Flexible Implementation:**
```typescript
interface HeaderProps {
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  navigation?: React.ReactNode;
  theme?: 'light' | 'dark' | 'glass';
  sticky?: boolean;
  className?: string;
}
```

#### Modal Organism (Priority 2)
**Source Analysis:**
- Todo App: Comprehensive modal with overlay and animations

**Enhanced Implementation:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
}
```

## Testing Strategy

### Unit Testing
- **Framework:** Jest + React Testing Library
- **Coverage:** 95% minimum for all components
- **Focus:** Component behavior, accessibility, edge cases

### Visual Regression Testing
- **Tool:** Chromatic or Percy with Storybook
- **Purpose:** Catch unintended visual changes
- **Automation:** Run on every PR

### Integration Testing
- **Approach:** Test components within application context
- **Tools:** Playwright for E2E testing
- **Focus:** Real-world usage scenarios

### Accessibility Testing
- **Automated:** axe-core integration in tests
- **Manual:** Screen reader testing
- **Compliance:** WCAG 2.1 AA standards

## Documentation Requirements

### Component Documentation
- **API Documentation:** Props, variants, usage examples
- **Design Guidelines:** When and how to use each component
- **Accessibility Notes:** ARIA patterns and keyboard navigation
- **Migration Guides:** Step-by-step replacement instructions

### Storybook Stories
- **Coverage:** Every component state and variant
- **Controls:** Interactive prop manipulation
- **Documentation:** Embedded usage examples
- **Accessibility:** Built-in a11y addon

### Contributing Guidelines
- **Process:** Component proposal → Design review → Implementation → Testing → Documentation
- **Standards:** Code style, naming conventions, testing requirements
- **Review Process:** Design system team approval for new components

## Performance Considerations

### Bundle Optimization
- **Tree Shaking:** Ensure all components support tree shaking
- **Code Splitting:** Lazy load complex organisms
- **Bundle Analysis:** Regular monitoring of library size impact

### Runtime Performance
- **Memoization:** Use React.memo for expensive components
- **Prop Optimization:** Avoid object/function props where possible
- **Rendering:** Optimize re-render patterns

### Development Experience
- **Fast Refresh:** Ensure hot reloading works with all components
- **Build Speed:** Optimize build times for development
- **IntelliSense:** Comprehensive TypeScript types for IDE support

This strategic approach ensures we build a robust, scalable component library that serves both current needs and future growth while maintaining development velocity throughout the transition.

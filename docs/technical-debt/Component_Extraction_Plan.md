# Component Extraction Plan - Phase 2 Implementation Guide

## Overview

This document provides detailed recommendations for extracting UI components from the existing applications (`web/ai-chat` and `web/todo-app`) into a shared component library. Based on the UI audit findings, this plan prioritizes components by impact and complexity.

## Component Library Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Header/
│   │   ├── ErrorMessage/
│   │   ├── LoadingSpinner/
│   │   └── index.ts
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── hooks/
│   ├── utils/
│   └── index.ts
├── docs/
├── stories/          # Storybook stories
├── deno.json
└── README.md
```

## Design Tokens Foundation

### Color System
```typescript
// packages/ui/src/tokens/colors.ts
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',  // Unified primary blue
    600: '#2563eb',
    900: '#1e3a8a'
  },
  
  // Semantic colors
  error: {
    50: '#fef2f2',
    100: '#fecaca',
    500: '#ef4444',
    600: '#dc2626'
  },
  
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    600: '#059669'
  },
  
  // Neutral colors
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
  }
};
```

### Typography System
```typescript
// packages/ui/src/tokens/typography.ts
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
  }
};
```

### Spacing System
```typescript
// packages/ui/src/tokens/spacing.ts
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
  12: '3rem'     // 48px
};
```

## Priority 1: Core Components

### 1. Button Component

**Source Analysis:**
- AI Chat: Inline styled buttons with JavaScript hover effects
- Todo App: CSS class-based buttons with comprehensive variants

**Extraction Strategy:**
```typescript
// packages/ui/src/components/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md', 
  disabled = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  // Implementation with design tokens
}
```

**Migration Path:**
1. Extract Todo App's button styles as base
2. Add AI Chat's hover interaction patterns
3. Implement loading states from both apps
4. Create comprehensive variant system

### 2. Input Components

**Source Analysis:**
- AI Chat: Basic textarea with auto-resize functionality
- Todo App: Comprehensive input system with validation

**Extraction Strategy:**
```typescript
// packages/ui/src/components/Input/Input.tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

// packages/ui/src/components/Input/Textarea.tsx  
interface TextareaProps {
  placeholder?: string;
  error?: string;
  autoResize?: boolean; // From AI Chat
  maxHeight?: string;
  rows?: number;
}
```

**Migration Path:**
1. Use Todo App's validation and error handling
2. Integrate AI Chat's auto-resize functionality
3. Standardize focus and interaction states
4. Add consistent styling with design tokens

### 3. Card Component

**Source Analysis:**
- AI Chat: No dedicated card component
- Todo App: Utility class `.card` with consistent styling

**Extraction Strategy:**
```typescript
// packages/ui/src/components/Card/Card.tsx
interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  border?: boolean;
  className?: string;
}
```

**Migration Path:**
1. Extract Todo App's card styles as foundation
2. Create flexible padding and shadow variants
3. Ensure consistent border radius and shadows

### 4. Loading Components

**Source Analysis:**
- AI Chat: Text-based loading states
- Todo App: Dedicated LoadingSpinner component

**Extraction Strategy:**
```typescript
// packages/ui/src/components/LoadingSpinner/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

// packages/ui/src/components/Button/Button.tsx (loading state)
// Integrate spinner into button component
```

**Migration Path:**
1. Use Todo App's spinner as base implementation
2. Add size variants and color customization
3. Integrate loading states into Button component
4. Create skeleton loader variants for content areas

## Priority 2: Layout & Navigation Components

### 5. Header Component

**Source Analysis:**
- AI Chat: Dark header with title and clear button
- Todo App: Glassmorphism header with branding

**Extraction Strategy:**
```typescript
// packages/ui/src/components/Header/Header.tsx
interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  theme?: 'light' | 'dark' | 'glass';
  sticky?: boolean;
}
```

**Migration Path:**
1. Create flexible slot-based header
2. Support both theme variants from existing apps
3. Add responsive behavior patterns
4. Implement sticky positioning option

### 6. Modal Component

**Source Analysis:**
- AI Chat: No modal component
- Todo App: Comprehensive modal with overlay and animations

**Extraction Strategy:**
```typescript
// packages/ui/src/components/Modal/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  showCloseButton?: boolean;
}
```

**Migration Path:**
1. Extract Todo App's modal implementation
2. Add accessibility features (focus management, escape key)
3. Implement size variants
4. Add animation system

### 7. Error/Alert Components

**Source Analysis:**
- AI Chat: Card-style error with retry/dismiss functionality
- Todo App: Banner-style error with close functionality

**Extraction Strategy:**
```typescript
// packages/ui/src/components/Alert/Alert.tsx
interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  variant?: 'banner' | 'card' | 'toast';
  title?: string;
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
  dismissible?: boolean;
}
```

**Migration Path:**
1. Combine both error patterns into unified Alert component
2. Support banner and card variants
3. Add toast notification capability
4. Implement consistent iconography

## Priority 3: Specialized Components

### 8. Form Components

**Source Analysis:**
- Todo App: Comprehensive form with validation and field groups

**Extraction Strategy:**
```typescript
// packages/ui/src/components/Form/Form.tsx
interface FormProps {
  onSubmit: (data: any) => void;
  validation?: ValidationSchema;
  children: React.ReactNode;
}

// packages/ui/src/components/Form/FormField.tsx
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}
```

### 9. Data Display Components

**Source Analysis:**
- Todo App: StatsCard with progress indicators and charts

**Extraction Strategy:**
```typescript
// packages/ui/src/components/StatsCard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  stats: StatItem[];
  showProgress?: boolean;
  progressValue?: number;
}
```

## Implementation Timeline

### Week 1-2: Foundation Setup
- [ ] Initialize component library package structure
- [ ] Implement design tokens (colors, typography, spacing)
- [ ] Set up build system and TypeScript configuration
- [ ] Create Storybook setup for component documentation

### Week 3-4: Core Components (Priority 1)
- [ ] Button component with all variants
- [ ] Input and Textarea components
- [ ] Card component
- [ ] LoadingSpinner component
- [ ] Write comprehensive tests for core components

### Week 5-6: Layout Components (Priority 2)  
- [ ] Header component with theme variants
- [ ] Modal component with accessibility features
- [ ] Alert/Error components with multiple variants
- [ ] Create usage documentation and examples

### Week 7-8: Integration & Migration
- [ ] Begin migrating AI Chat to use shared components
- [ ] Begin migrating Todo App to use shared components
- [ ] Address integration issues and component refinements
- [ ] Performance optimization and bundle analysis

### Week 9-10: Advanced Components (Priority 3)
- [ ] Form components and validation system
- [ ] Data display components (StatsCard, etc.)
- [ ] Specialized components based on application needs
- [ ] Final testing and documentation

## Migration Strategy

### Incremental Adoption
1. **Start with new features**: Use shared components for all new development
2. **Replace on modification**: When modifying existing components, migrate to shared version
3. **Batch migration**: Migrate similar components together (all buttons, all inputs)
4. **Maintain compatibility**: Keep old components during transition period

### Testing Strategy
1. **Unit tests**: Comprehensive testing for all shared components
2. **Visual regression**: Screenshot testing for UI consistency
3. **Integration tests**: Test components within application context
4. **Accessibility tests**: Ensure WCAG compliance for all components

### Documentation Requirements
1. **Component API**: Props, variants, and usage examples
2. **Design guidelines**: When and how to use each component
3. **Migration guides**: Step-by-step migration instructions
4. **Storybook stories**: Interactive component showcase

## Success Criteria

- [ ] All Priority 1 components implemented and tested
- [ ] Both applications using shared components for new development
- [ ] 50% reduction in duplicate UI code across applications
- [ ] Consistent visual design and interaction patterns
- [ ] Comprehensive documentation and examples
- [ ] Performance metrics maintained or improved
- [ ] Developer satisfaction with component library usage

## Risk Mitigation

### Technical Risks
- **Breaking changes**: Maintain backward compatibility during migration
- **Performance impact**: Monitor bundle sizes and optimize shared components
- **Styling conflicts**: Use CSS-in-JS or CSS Modules for style isolation

### Process Risks  
- **Adoption resistance**: Provide clear migration guides and support
- **Incomplete migration**: Set clear deadlines and migration milestones
- **Maintenance overhead**: Establish clear ownership and contribution guidelines

## Conclusion

This component extraction plan provides a structured approach to creating a unified component library that addresses the inconsistencies identified in the UI audit. By prioritizing core components and following an incremental migration strategy, we can achieve consistency while minimizing disruption to ongoing development.

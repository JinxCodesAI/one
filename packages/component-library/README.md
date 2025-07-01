# @one/component-library

A comprehensive, highly customizable React component library built with TypeScript and Deno. Designed to unify UI patterns across web applications while providing maximum flexibility for theming and customization.

## 🎯 Design Philosophy

- **Atomic Design**: Components organized as Atoms → Molecules → Organisms
- **Highly Customizable**: Design tokens and theme system for easy customization
- **Type-Safe**: Full TypeScript support with comprehensive prop interfaces
- **Accessible**: WCAG 2.1 AA compliance built-in
- **Performance**: Optimized for tree-shaking and minimal bundle impact
- **Developer Experience**: Comprehensive Storybook documentation

## 📦 Installation

```bash
# Add to your deno.json imports
{
  "imports": {
    "@one/component-library": "./packages/component-library/src/index.ts",
    "@one/component-library/tokens": "./packages/component-library/src/tokens/index.ts"
  }
}
```

## 🚀 Quick Start

```tsx
import { Button, Input, Card } from "@one/component-library";
import { ThemeProvider } from "@one/component-library/providers";

function App() {
  return (
    <ThemeProvider>
      <Card>
        <Input placeholder="Enter your name" />
        <Button variant="primary">Submit</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## 🎨 Theming & Customization

The component library uses a comprehensive design token system that allows for easy customization:

```tsx
import { createTheme, ThemeProvider } from "@one/component-library/tokens";

const customTheme = createTheme({
  colors: {
    primary: {
      500: "#your-brand-color",
      600: "#your-brand-color-dark"
    }
  },
  typography: {
    fontFamily: {
      sans: ["Your Custom Font", "sans-serif"]
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

## 📚 Component Categories

### Atoms (Basic Building Blocks)
- `Button` - Comprehensive button with variants, sizes, and states
- `Input` - Text input with validation and error states
- `Textarea` - Auto-resizing textarea with validation
- `Select` - Dropdown select with custom styling
- `Checkbox` - Styled checkbox with indeterminate state
- `LoadingSpinner` - Configurable loading indicator
- `Icon` - Icon system with size variants
- `Badge` - Status and category badges
- `Avatar` - User avatar with fallback generation

### Molecules (Functional Groupings)
- `FormField` - Label + Input + Error message composition
- `SearchForm` - Search input with button
- `Alert` - Notification messages with actions
- `Card` - Content container with variants
- `Pagination` - Page navigation controls
- `Breadcrumb` - Navigation breadcrumbs
- `Tabs` - Tab navigation system

### Organisms (Complex Components)
- `Header` - Application header with flexible content slots
- `Modal` - Accessible modal dialog system
- `DataTable` - Feature-rich data table
- `Form` - Complete form system with validation
- `Navigation` - Main navigation component
- `Sidebar` - Collapsible sidebar layout

## 🛠️ Development

```bash
# Start development server
deno task dev

# Run tests
deno task test

# Start Storybook
deno task storybook

# Build for production
deno task build

# Lint and format
deno task lint
deno task fmt
```

## 📖 Documentation

- **Storybook**: Interactive component documentation
- **API Reference**: Complete TypeScript interfaces
- **Design Guidelines**: When and how to use each component
- **Migration Guide**: Upgrading from application-specific components

## 🎯 Design Tokens

All visual properties are controlled through design tokens:

- **Colors**: Semantic color system with light/dark mode support
- **Typography**: Font scales, weights, and line heights
- **Spacing**: 8px-based spacing scale
- **Borders**: Border radius and width tokens
- **Shadows**: Elevation system for depth
- **Breakpoints**: Responsive design breakpoints

## 🔧 Customization Examples

### Custom Color Scheme
```tsx
const theme = createTheme({
  colors: {
    primary: { 500: "#6366f1", 600: "#4f46e5" },
    background: {
      primary: "#ffffff",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }
  }
});
```

### Custom Typography
```tsx
const theme = createTheme({
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"]
    },
    fontSize: {
      base: "1rem",
      lg: "1.125rem"
    }
  }
});
```

## 🚀 Performance

- **Tree Shaking**: Import only what you need
- **Bundle Analysis**: Regular monitoring of library size impact
- **Lazy Loading**: Complex organisms support code splitting
- **Memoization**: Optimized re-render patterns

## ♿ Accessibility

- **WCAG 2.1 AA**: Full compliance with accessibility standards
- **Keyboard Navigation**: Complete keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical focus flow and visible indicators
- **Color Contrast**: Meets contrast ratio requirements

## 🧪 Testing

- **Unit Tests**: Comprehensive component behavior testing
- **Visual Regression**: Automated visual testing with Storybook
- **Accessibility Tests**: Automated a11y testing
- **Integration Tests**: Real-world usage scenarios

## 📋 Migration Guide

See [MIGRATION.md](./MIGRATION.md) for detailed instructions on migrating from application-specific components to the shared library.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on contributing to the component library.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

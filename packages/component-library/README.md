# @one/component-library

A comprehensive, highly customizable React component library built with TypeScript and Deno. Designed to unify UI patterns across web applications while providing maximum flexibility for theming and customization.

## 🎯 Design Philosophy

- **Atomic Design**: Components organized as Atoms → Molecules → Organisms
- **Highly Customizable**: Design tokens and theme system for easy customization
- **Type-Safe**: Full TypeScript support with comprehensive prop interfaces
- **Accessible**: WCAG 2.1 AA compliance built-in
- **Performance**: Optimized for tree-shaking and minimal bundle impact
- **Developer Experience**: Comprehensive Storybook documentation with interactive examples

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

## 📚 Storybook Documentation

The component library includes comprehensive Storybook documentation with interactive examples, design tokens showcase, and real-world usage patterns.

### 🚀 Running Storybook

#### Prerequisites
First, install Node.js dependencies for Storybook:

```bash
# Navigate to the component library directory
cd packages/component-library

# Install Storybook dependencies
deno task storybook:install
# or
npm install
```

#### Development Server
Start the Storybook development server:

```bash
# Using Deno tasks
deno task storybook

# Or directly with npm
npm run storybook
```

This will start Storybook at `http://localhost:6006` with:
- **Live reload**: Automatic updates when you modify stories or components
- **Interactive controls**: Modify component props in real-time
- **Accessibility testing**: Built-in a11y addon for testing compliance
- **Responsive testing**: Test components across different viewport sizes
- **Theme switching**: Toggle between different application themes

#### Production Build
Build Storybook for production deployment:

```bash
# Build static Storybook
deno task storybook:build

# Serve the built Storybook
deno task storybook:serve
```

### 📖 Storybook Structure

The Storybook is organized into several main sections:

#### **Introduction**
- Welcome guide and overview
- Installation instructions
- Quick start examples
- Architecture explanation

#### **Design System**
- **Design Tokens**: Complete showcase of colors, typography, spacing, borders, and breakpoints
- **Theme Examples**: AI Chat and Todo App theme demonstrations
- **Customization Guide**: How to create and apply custom themes

#### **Components**
Each component includes comprehensive stories:

**Atoms** (Basic building blocks)
- **Button**: All variants, sizes, states, and real-world examples
- **Input**: Validation states, icons, different input types
- **Textarea**: Auto-resize functionality, validation states
- **LoadingSpinner**: All sizes, colors, and usage contexts
- **Badge**: Priority variants, styles, and semantic usage

**Molecules** (Functional groupings)
- **FormField**: Complete form field composition with validation
- **Alert**: Error handling, notifications, and retry functionality
- **Card**: Content containers with various visual styles

**Organisms** (Complex components)
- **Modal**: Comprehensive modal system with accessibility features

#### **Real-World Examples**
- **AI Chat Patterns**: Message inputs, error handling, loading states
- **Todo App Patterns**: Task forms, priority badges, card layouts
- **Form Patterns**: Complete form compositions and validation
- **Dashboard Patterns**: Metric cards, status indicators

### 🎯 Story Features

Each component story includes:

#### **Interactive Controls**
- Modify props in real-time using Storybook controls
- Test different combinations of props and states
- See immediate visual feedback

#### **Multiple Examples**
- Basic usage examples
- All variants and sizes
- Different states (loading, error, success)
- Real-world usage scenarios

#### **Accessibility Testing**
- Built-in accessibility addon
- WCAG compliance checking
- Keyboard navigation testing
- Screen reader compatibility

#### **Responsive Testing**
- Multiple viewport sizes
- Mobile, tablet, and desktop views
- Responsive behavior demonstration

#### **Code Examples**
- Copy-paste ready code snippets
- TypeScript interfaces and prop documentation
- Usage examples with proper imports

### 🔄 Updating Storybook

#### Adding New Stories
When adding new components, create corresponding stories:

```tsx
// src/atoms/NewComponent/NewComponent.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { NewComponent } from "./NewComponent.tsx";

const meta: Meta<typeof NewComponent> = {
  title: "Atoms/NewComponent",
  component: NewComponent,
  parameters: {
    docs: {
      description: {
        component: "Description of the new component..."
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof NewComponent>;

export const Default: Story = {
  args: {
    // Default props
  }
};
```

#### Updating Existing Stories
When modifying components:

1. **Update prop interfaces**: Ensure stories reflect new props
2. **Add new examples**: Show new functionality or variants
3. **Update documentation**: Keep descriptions current
4. **Test accessibility**: Verify WCAG compliance

#### Story Best Practices

1. **Comprehensive Coverage**: Include all variants, sizes, and states
2. **Real-World Examples**: Show actual usage patterns from applications
3. **Interactive Controls**: Make props controllable where appropriate
4. **Clear Documentation**: Provide helpful descriptions and usage notes
5. **Accessibility Focus**: Include accessibility considerations

### 🚀 Deployment

#### Automated Deployment
Storybook can be automatically deployed on:
- **Vercel**: Connect your repository for automatic deployments
- **Netlify**: Deploy from Git with build commands
- **GitHub Pages**: Use GitHub Actions for automated deployment

#### Manual Deployment
```bash
# Build Storybook
deno task storybook:build

# Deploy the storybook-static folder to your hosting service
```

### 🔧 Customization

#### Storybook Configuration
Customize Storybook in `.storybook/main.ts`:
- Add new addons
- Configure build settings
- Modify story patterns

#### Theme Configuration
Customize Storybook's appearance in `.storybook/manager.ts`:
- Brand colors and logos
- UI customization
- Custom themes

#### Preview Configuration
Configure story rendering in `.storybook/preview.ts`:
- Global decorators
- Default parameters
- Background options
- Viewport configurations

## 📋 Migration Guide

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions on migrating from application-specific components to the shared library.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on contributing to the component library.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

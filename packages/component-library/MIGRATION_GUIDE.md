# Migration Guide

This guide provides step-by-step instructions for migrating from application-specific components to the shared component library.

## 🎯 Migration Strategy

### Phase 1: Setup and Foundation
1. Install the component library
2. Set up theme configuration
3. Import design tokens

### Phase 2: Atomic Component Migration
1. Replace buttons
2. Replace inputs and form elements
3. Replace loading indicators
4. Replace badges and status indicators

### Phase 3: Molecular Component Migration
1. Replace form field compositions
2. Replace alert/error components
3. Replace card components

### Phase 4: Organism Migration
1. Replace modal systems
2. Replace complex layouts

## 📦 Installation

Add to your `deno.json` imports:

```json
{
  "imports": {
    "@one/component-library": "./packages/component-library/src/index.ts",
    "@one/component-library/tokens": "./packages/component-library/src/tokens/index.ts"
  }
}
```

## 🎨 Theme Setup

### AI Chat Application Theme

```tsx
// src/theme.ts
import { createTheme } from "@one/component-library/tokens";

export const aiChatTheme = createTheme({
  colors: {
    primary: {
      500: "#2563eb", // AI Chat primary blue
      600: "#1d4ed8",
    },
    background: {
      primary: "#ffffff",
    },
    text: {
      primary: "#374151",
    },
  },
});
```

### Todo App Application Theme

```tsx
// src/theme.ts
import { createTheme } from "@one/component-library/tokens";

export const todoAppTheme = createTheme({
  colors: {
    primary: {
      500: "#3b82f6", // Todo App primary blue
      600: "#2563eb",
    },
    background: {
      primary: "#ffffff",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
  },
});
```

## 🔄 Component Migrations

### AI Chat Application

#### 1. Header Component

**Before:**
```tsx
// src/components/Header.tsx
<header style={{
  padding: "1rem 1.5rem",
  backgroundColor: "#1f2937",
  color: "white",
  // ... more inline styles
}}>
  <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>
    AI Chat
  </h1>
  <button
    onClick={onClearConversation}
    style={{
      padding: "0.5rem 1rem",
      backgroundColor: "#374151",
      // ... more inline styles
    }}
  >
    Clear Chat
  </button>
</header>
```

**After:**
```tsx
// src/components/Header.tsx
import { Button } from "@one/component-library";

<header style={{
  padding: "1rem 1.5rem",
  backgroundColor: "#1f2937",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}}>
  <h1 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>
    AI Chat
  </h1>
  <Button
    variant="secondary"
    size="sm"
    onClick={onClearConversation}
  >
    Clear Chat
  </Button>
</header>
```

#### 2. MessageInput Component

**Before:**
```tsx
// src/components/MessageInput.tsx
<textarea
  ref={textareaRef}
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  style={{
    flex: 1,
    minHeight: "2.5rem",
    maxHeight: "8rem",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    // ... more styles
  }}
/>
<button
  type="submit"
  disabled={isDisabled}
  style={{
    padding: "0.75rem 1rem",
    backgroundColor: "#2563eb",
    color: "white",
    // ... more styles
  }}
>
  Send
</button>
```

**After:**
```tsx
// src/components/MessageInput.tsx
import { Textarea, Button } from "@one/component-library";

<Textarea
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  autoResize
  maxHeight="8rem"
  placeholder="Type your message..."
/>
<Button
  type="submit"
  disabled={isDisabled}
  loading={isSubmitting}
  icon="📤"
>
  Send
</Button>
```

#### 3. ErrorMessage Component

**Before:**
```tsx
// src/components/ErrorMessage.tsx
<div style={{
  margin: "1rem",
  padding: "1rem",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.5rem",
  color: "#dc2626",
}}>
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <span>⚠️</span>
    <span>{error}</span>
  </div>
  {onRetry && (
    <button onClick={onRetry}>Retry</button>
  )}
</div>
```

**After:**
```tsx
// src/components/ErrorMessage.tsx
import { Alert } from "@one/component-library";

<Alert
  type="error"
  variant="card"
  message={error}
  onRetry={onRetry}
  onClose={onDismiss}
  dismissible
/>
```

### Todo App Application

#### 1. Button Replacements

**Before:**
```tsx
// Various buttons throughout the app
<button className="btn btn-primary" onClick={handleSubmit}>
  Add Task
</button>

<button className="btn btn-secondary" onClick={handleAI}>
  ✨ AI Assistant
</button>

<button className="btn btn-danger btn-sm" onClick={handleDelete}>
  🗑️ Delete
</button>
```

**After:**
```tsx
import { Button } from "@one/component-library";

<Button variant="primary" onClick={handleSubmit}>
  Add Task
</Button>

<Button variant="secondary" icon="✨" onClick={handleAI}>
  AI Assistant
</Button>

<Button variant="danger" size="sm" icon="🗑️" onClick={handleDelete}>
  Delete
</Button>
```

#### 2. Form Field Replacements

**Before:**
```tsx
// TodoForm.tsx
<div className="form-group">
  <label htmlFor="title">
    Title <span className="required">*</span>
  </label>
  <input
    id="title"
    type="text"
    className={`input ${errors.title ? 'input-error' : ''}`}
    value={formData.title}
    onChange={(e) => setFormData({...formData, title: e.target.value})}
  />
  {errors.title && (
    <div className="text-error">{errors.title}</div>
  )}
</div>
```

**After:**
```tsx
import { FormField, Input } from "@one/component-library";

<FormField
  label="Title"
  required
  error={errors.title}
>
  <Input
    type="text"
    value={formData.title}
    onChange={(e) => setFormData({...formData, title: e.target.value})}
    fullWidth
  />
</FormField>
```

#### 3. LoadingSpinner Replacement

**Before:**
```tsx
// components/common/LoadingSpinner.tsx
<div 
  className="loading-spinner"
  style={{
    width: sizeMap[size],
    height: sizeMap[size],
    borderColor: `${color}20`,
    borderTopColor: color
  }}
/>
```

**After:**
```tsx
import { LoadingSpinner } from "@one/component-library";

<LoadingSpinner size={size} color={color} />
```

#### 4. Modal Replacement

**Before:**
```tsx
// Modal usage in TodoForm
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h3>Add New Task</h3>
      <button className="modal-close" onClick={onClose}>×</button>
    </div>
    <form onSubmit={handleSubmit}>
      {/* form content */}
    </form>
    <div className="modal-footer">
      <button className="btn btn-outline" onClick={onClose}>
        Cancel
      </button>
      <button className="btn btn-primary" type="submit">
        Create Task
      </button>
    </div>
  </div>
</div>
```

**After:**
```tsx
import { Modal, Button } from "@one/component-library";

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Add New Task"
  size="md"
  footer={
    <>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="todo-form">
        Create Task
      </Button>
    </>
  }
>
  <form id="todo-form" onSubmit={handleSubmit}>
    {/* form content */}
  </form>
</Modal>
```

## 🎯 Migration Checklist

### AI Chat Application
- [ ] Replace Header button with `<Button>` component
- [ ] Replace MessageInput with `<Textarea autoResize>`
- [ ] Replace ErrorMessage with `<Alert>` component
- [ ] Replace loading states with `<LoadingSpinner>`
- [ ] Update ModelSelector styling to use design tokens
- [ ] Remove inline styles in favor of design tokens

### Todo App Application
- [ ] Replace all `.btn` classes with `<Button>` component
- [ ] Replace form fields with `<FormField>` + `<Input>` composition
- [ ] Replace LoadingSpinner with library component
- [ ] Replace ErrorMessage with `<Alert>` component
- [ ] Replace modal system with `<Modal>` component
- [ ] Replace priority badges with `<Badge priority="high|medium|low">`
- [ ] Update card components to use `<Card>` component
- [ ] Migrate utility classes to design tokens

## 🔧 Troubleshooting

### Common Issues

1. **Styling Conflicts**: Remove old CSS classes when migrating to new components
2. **TypeScript Errors**: Ensure proper prop types are used
3. **Missing Functionality**: Check if component supports needed features or use composition
4. **Theme Not Applied**: Ensure theme is properly configured and imported

### Performance Considerations

1. **Bundle Size**: Import only needed components
2. **Re-renders**: Use React.memo for expensive components
3. **CSS-in-JS**: Components use inline styles for isolation

## 📚 Additional Resources

- [Component Inventory](./COMPONENT_INVENTORY.md) - Complete list of available components
- [Design Tokens Documentation](./src/tokens/README.md) - Design system tokens
- [Storybook Documentation](./stories/) - Interactive component examples

## 🤝 Getting Help

If you encounter issues during migration:
1. Check the component documentation in Storybook
2. Review the component source code for advanced usage
3. Refer to the design tokens for customization options
4. Create an issue in the component library repository

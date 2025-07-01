/**
 * Input Component Stories
 * 
 * Comprehensive Storybook stories showcasing all Input variants,
 * sizes, states, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input.tsx";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Input component is a versatile text input that supports validation states, icons, and consistent styling.
It consolidates input patterns from both applications with enhanced functionality.

## Features
- Multiple sizes (sm, md, lg)
- Error and success states
- Left and right icon support
- Full width option
- Focus management with visual feedback
- Comprehensive accessibility support
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the input",
    },
    error: {
      control: { type: "text" },
      description: "Error message to display (also sets error state)",
    },
    success: {
      control: { type: "boolean" },
      description: "Success state styling",
    },
    fullWidth: {
      control: { type: "boolean" },
      description: "Makes input take full width of container",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the input",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    type: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "tel", "url"],
      description: "Input type",
    },
  },
  args: {
    placeholder: "Enter text...",
    size: "md",
    fullWidth: false,
    disabled: false,
    success: false,
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Basic variants
export const Default: Story = {
  args: {
    placeholder: "Default input",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Input with error",
    error: "This field is required",
  },
};

export const Success: Story = {
  args: {
    placeholder: "Valid input",
    success: true,
    value: "Valid value",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
    value: "Cannot edit this",
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Inputs come in three sizes: small (sm), medium (md), and large (lg).",
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
      <Input leftIcon="🔍" placeholder="Search..." />
      <Input rightIcon="👁️" type="password" placeholder="Password" />
      <Input leftIcon="📧" rightIcon="✓" placeholder="Email" success />
      <Input leftIcon="⚠️" placeholder="Error state" error="Invalid input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Inputs can include icons on the left or right side.",
      },
    },
  },
};

// Input Types
export const InputTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
      <Input type="text" placeholder="Text input" leftIcon="📝" />
      <Input type="email" placeholder="Email input" leftIcon="📧" />
      <Input type="password" placeholder="Password input" leftIcon="🔒" />
      <Input type="number" placeholder="Number input" leftIcon="🔢" />
      <Input type="tel" placeholder="Phone input" leftIcon="📞" />
      <Input type="url" placeholder="URL input" leftIcon="🌐" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different input types with appropriate icons and validation.",
      },
    },
  },
};

// States Showcase
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
      <Input placeholder="Normal state" />
      <Input placeholder="Success state" success value="Valid input" />
      <Input placeholder="Error state" error="This field is required" />
      <Input placeholder="Disabled state" disabled value="Cannot edit" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All possible input states: normal, success, error, and disabled.",
      },
    },
  },
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Input fullWidth placeholder="Full width input" leftIcon="📝" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Input can be made to take the full width of its container.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Search Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Search Inputs</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "300px" }}>
          <Input leftIcon="🔍" placeholder="Search tasks..." />
          <Input leftIcon="🔍" placeholder="Search users..." size="sm" />
          <Input leftIcon="🔍" rightIcon="⌘K" placeholder="Global search..." />
        </div>
      </div>

      {/* Form Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Form Inputs</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "300px" }}>
          <Input type="email" leftIcon="📧" placeholder="your@email.com" />
          <Input type="password" leftIcon="🔒" placeholder="Password" />
          <Input type="tel" leftIcon="📞" placeholder="+1 (555) 123-4567" />
          <Input type="url" leftIcon="🌐" placeholder="https://example.com" />
        </div>
      </div>

      {/* Validation Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Validation States</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "300px" }}>
          <Input 
            type="email" 
            leftIcon="📧" 
            value="user@example.com" 
            success 
            placeholder="Valid email"
          />
          <Input 
            type="email" 
            leftIcon="📧" 
            value="invalid-email" 
            error="Please enter a valid email address"
            placeholder="Invalid email"
          />
          <Input 
            leftIcon="👤" 
            value="john_doe" 
            success 
            placeholder="Username"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world usage examples showing search, form, and validation scenarios.",
      },
    },
  },
};

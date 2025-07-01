/**
 * Button Component Stories
 * 
 * Comprehensive Storybook stories showcasing all Button variants,
 * sizes, states, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.tsx";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Button component is a versatile, accessible button that supports multiple variants, sizes, and states.
It consolidates button patterns from both AI Chat and Todo applications with enhanced functionality.

## Features
- Multiple visual variants (primary, secondary, outline, ghost, danger)
- Three sizes (sm, md, lg)
- Loading states with spinner
- Icon support with positioning
- Full width option
- Comprehensive accessibility support
- Hover and focus states
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "ghost", "danger"],
      description: "Visual style variant of the button",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the button",
    },
    loading: {
      control: { type: "boolean" },
      description: "Shows loading spinner and disables interaction",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the button",
    },
    fullWidth: {
      control: { type: "boolean" },
      description: "Makes button take full width of container",
    },
    iconPosition: {
      control: { type: "select" },
      options: ["left", "right"],
      description: "Position of the icon relative to text",
    },
    children: {
      control: { type: "text" },
      description: "Button content/text",
    },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    fullWidth: false,
    iconPosition: "left",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic variants
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Button",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Danger Button",
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Buttons come in three sizes: small (sm), medium (md), and large (lg).",
      },
    },
  },
};

// States
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button>Normal</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Buttons support normal, loading, and disabled states.",
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexDirection: "column", alignItems: "flex-start" }}>
      <Button icon="🚀" iconPosition="left">Launch</Button>
      <Button icon="📁" iconPosition="right">Save File</Button>
      <Button variant="outline" icon="⚙️">Settings</Button>
      <Button variant="danger" icon="🗑️">Delete</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Buttons can include icons positioned on the left or right side of the text.",
      },
    },
  },
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Button fullWidth>Full Width Button</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Buttons can be made to take the full width of their container.",
      },
    },
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available button variants displayed together.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
      {/* AI Chat Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>AI Chat Examples</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="primary" icon="📤">Send Message</Button>
          <Button variant="outline" icon="🗑️">Clear Chat</Button>
          <Button variant="ghost" size="sm">Retry</Button>
        </div>
      </div>

      {/* Todo App Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Todo App Examples</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="primary" icon="➕">Add Task</Button>
          <Button variant="secondary" icon="✨">AI Assistant</Button>
          <Button variant="outline">Clear Filters</Button>
          <Button variant="danger" size="sm" icon="🗑️">Delete</Button>
        </div>
      </div>

      {/* Form Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Form Examples</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button variant="primary" type="submit">Submit</Button>
          <Button variant="outline" type="button">Cancel</Button>
          <Button variant="ghost" type="reset">Reset</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world usage examples from both AI Chat and Todo applications.",
      },
    },
  },
};

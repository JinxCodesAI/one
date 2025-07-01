/**
 * Badge Component Stories
 * 
 * Comprehensive Storybook stories showcasing all Badge variants,
 * sizes, styles, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge.tsx";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Badge component provides status indicators, categories, and priority labels
based on patterns from the Todo application with enhanced functionality.

## Features
- Seven semantic variants (default, primary, secondary, success, warning, error, info)
- Three sizes (sm, md, lg)
- Three visual styles (filled, outline, soft)
- Priority-specific styling (high, medium, low)
- Custom color support
- Consistent with design system
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "success", "warning", "error", "info"],
      description: "Badge visual variant",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the badge",
    },
    style: {
      control: { type: "select" },
      options: ["filled", "outline", "soft"],
      description: "Visual style of the badge",
    },
    priority: {
      control: { type: "select" },
      options: [undefined, "high", "medium", "low"],
      description: "Priority-specific styling (overrides variant)",
    },
    color: {
      control: { type: "color" },
      description: "Custom color override",
    },
    children: {
      control: { type: "text" },
      description: "Badge content",
    },
  },
  args: {
    children: "Badge",
    variant: "default",
    size: "md",
    style: "filled",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Basic variants
export const Default: Story = {
  args: {
    children: "Default",
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Success",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Warning",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    children: "Error",
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available badge variants with their semantic colors.",
      },
    },
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Badge size="sm" variant="primary">Small</Badge>
      <Badge size="md" variant="primary">Medium</Badge>
      <Badge size="lg" variant="primary">Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges come in three sizes: small (sm), medium (md), and large (lg).",
      },
    },
  },
};

// Styles
export const Styles: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: "60px", fontSize: "0.875rem" }}>Filled:</span>
        <Badge variant="primary" style="filled">Filled</Badge>
        <Badge variant="success" style="filled">Success</Badge>
        <Badge variant="warning" style="filled">Warning</Badge>
        <Badge variant="error" style="filled">Error</Badge>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: "60px", fontSize: "0.875rem" }}>Outline:</span>
        <Badge variant="primary" style="outline">Outline</Badge>
        <Badge variant="success" style="outline">Success</Badge>
        <Badge variant="warning" style="outline">Warning</Badge>
        <Badge variant="error" style="outline">Error</Badge>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: "60px", fontSize: "0.875rem" }}>Soft:</span>
        <Badge variant="primary" style="soft">Soft</Badge>
        <Badge variant="success" style="soft">Success</Badge>
        <Badge variant="warning" style="soft">Warning</Badge>
        <Badge variant="error" style="soft">Error</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Three visual styles: filled (solid background), outline (border only), and soft (light background).",
      },
    },
  },
};

// Priority Badges
export const Priority: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: "60px", fontSize: "0.875rem" }}>Filled:</span>
        <Badge priority="high">High Priority</Badge>
        <Badge priority="medium">Medium Priority</Badge>
        <Badge priority="low">Low Priority</Badge>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: "60px", fontSize: "0.875rem" }}>Outline:</span>
        <Badge priority="high" style="outline">High Priority</Badge>
        <Badge priority="medium" style="outline">Medium Priority</Badge>
        <Badge priority="low" style="outline">Low Priority</Badge>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: "60px", fontSize: "0.875rem" }}>Soft:</span>
        <Badge priority="high" style="soft">High Priority</Badge>
        <Badge priority="medium" style="soft">Medium Priority</Badge>
        <Badge priority="low" style="soft">Low Priority</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Priority badges automatically use semantic colors: high (red), medium (orange), low (green).",
      },
    },
  },
};

// Custom Colors
export const CustomColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Badge color="#8b5cf6">Purple</Badge>
      <Badge color="#ec4899" style="outline">Pink</Badge>
      <Badge color="#06b6d4" style="soft">Cyan</Badge>
      <Badge color="#84cc16">Lime</Badge>
      <Badge color="#f97316" style="outline">Orange</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges can use custom colors for brand-specific or unique categorization needs.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Todo App Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Todo App Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Task Priorities */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>Task Priorities</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Badge priority="high" size="sm">Urgent</Badge>
              <Badge priority="medium" size="sm">Important</Badge>
              <Badge priority="low" size="sm">Low</Badge>
            </div>
          </div>

          {/* Task Status */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>Task Status</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Badge variant="warning" style="soft">In Progress</Badge>
              <Badge variant="success">Completed</Badge>
              <Badge variant="error" style="outline">Overdue</Badge>
              <Badge variant="info" style="soft">Review</Badge>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>Categories</h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Badge color="#8b5cf6" style="soft">Work</Badge>
              <Badge color="#06b6d4" style="soft">Personal</Badge>
              <Badge color="#10b981" style="soft">Health</Badge>
              <Badge color="#f59e0b" style="soft">Shopping</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>AI Chat Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Model Indicators */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>AI Models</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Badge variant="primary" size="sm">GPT-4</Badge>
              <Badge variant="secondary" size="sm">Claude</Badge>
              <Badge variant="info" size="sm">Gemini</Badge>
            </div>
          </div>

          {/* Message Status */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>Message Status</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Badge variant="success" style="soft" size="sm">Sent</Badge>
              <Badge variant="warning" style="soft" size="sm">Pending</Badge>
              <Badge variant="error" style="soft" size="sm">Failed</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* General UI Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>General UI Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Notifications */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>Notifications</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Badge variant="error" size="sm">3</Badge>
              <Badge variant="warning" size="sm">12</Badge>
              <Badge variant="info" size="sm">New</Badge>
            </div>
          </div>

          {/* Feature Flags */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>Feature Status</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Badge variant="success" style="soft">Beta</Badge>
              <Badge variant="warning" style="soft">Experimental</Badge>
              <Badge variant="primary" style="soft">New</Badge>
              <Badge variant="secondary" style="outline">Deprecated</Badge>
            </div>
          </div>

          {/* Version Tags */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#6b7280" }}>Version Tags</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Badge variant="primary">v2.1.0</Badge>
              <Badge variant="success" style="outline">Latest</Badge>
              <Badge variant="warning" style="soft">RC</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world usage examples from Todo App, AI Chat, and common UI patterns.",
      },
    },
  },
};

/**
 * Card Component Stories
 * 
 * Comprehensive Storybook stories showcasing all Card variants,
 * padding options, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card.tsx";
import { Badge } from "../../atoms/Badge/Badge.tsx";
import { Button } from "../../atoms/Button/Button.tsx";

const meta: Meta<typeof Card> = {
  title: "Molecules/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Card component provides a versatile container for content grouping with various visual variants.
It's based on patterns from the Todo application with enhanced functionality.

## Features
- Four visual variants (default, elevated, outlined, glass)
- Four padding sizes (none, sm, md, lg)
- Interactive hover effects
- Click handlers for interactive cards
- Glassmorphism support
- Consistent with design system
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "elevated", "outlined", "glass"],
      description: "Visual variant of the card",
    },
    padding: {
      control: { type: "select" },
      options: ["none", "sm", "md", "lg"],
      description: "Internal padding size",
    },
    interactive: {
      control: { type: "boolean" },
      description: "Enable hover effects",
    },
    children: {
      control: { type: "text" },
      description: "Card content",
    },
  },
  args: {
    variant: "default",
    padding: "md",
    interactive: false,
    children: "Card content",
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic variants
export const Default: Story = {
  args: {
    children: "This is a default card with standard styling",
  },
};

export const Elevated: Story = {
  args: {
    variant: "elevated",
    children: "This is an elevated card with shadow",
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    children: "This is an outlined card with border",
  },
};

export const Glass: Story = {
  args: {
    variant: "glass",
    children: "This is a glass card with backdrop blur",
  },
  parameters: {
    backgrounds: { default: "gradient" },
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", width: "600px" }}>
      <Card variant="default">
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Default Card</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Standard card with subtle shadow</p>
      </Card>
      <Card variant="elevated">
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Elevated Card</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Card with prominent shadow</p>
      </Card>
      <Card variant="outlined">
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Outlined Card</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Card with border styling</p>
      </Card>
      <Card variant="glass">
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Glass Card</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Card with glassmorphism effect</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available card variants with their distinctive visual styles.",
      },
    },
  },
};

// Padding Sizes
export const PaddingSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "400px" }}>
      <Card padding="none" variant="outlined">
        <div style={{ padding: "0.5rem", backgroundColor: "#f3f4f6", margin: "-1px" }}>
          No Padding - Content touches edges
        </div>
      </Card>
      <Card padding="sm" variant="outlined">
        Small Padding - Compact spacing
      </Card>
      <Card padding="md" variant="outlined">
        Medium Padding - Standard spacing
      </Card>
      <Card padding="lg" variant="outlined">
        Large Padding - Generous spacing
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different padding sizes from none to large for various content densities.",
      },
    },
  },
};

// Interactive Cards
export const Interactive: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", width: "600px" }}>
      <Card variant="default" interactive>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Interactive Card</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Hover to see the effect</p>
      </Card>
      <Card variant="elevated" interactive onClick={() => alert("Card clicked!")}>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Clickable Card</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Click me!</p>
      </Card>
      <Card variant="outlined" interactive>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Hover Effect</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Interactive outline card</p>
      </Card>
      <Card variant="glass" interactive>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Glass Interactive</h4>
        <p style={{ margin: 0, color: "#6b7280" }}>Glassmorphism with hover</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Interactive cards with hover effects and click handlers.",
      },
    },
  },
};

// Content Examples
export const ContentExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
      {/* Profile Card */}
      <Card variant="elevated" padding="lg">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            borderRadius: "50%", 
            backgroundColor: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1.5rem",
            fontWeight: "bold"
          }}>
            JD
          </div>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0" }}>John Doe</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>Software Developer</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <Badge variant="primary" size="sm">React</Badge>
          <Badge variant="secondary" size="sm">TypeScript</Badge>
          <Badge variant="info" size="sm">Node.js</Badge>
        </div>
        <Button variant="outline" size="sm" fullWidth>
          View Profile
        </Button>
      </Card>

      {/* Stats Card */}
      <Card variant="default" padding="lg">
        <h3 style={{ margin: "0 0 1rem 0" }}>Task Statistics</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Completed</span>
            <Badge variant="success">24</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>In Progress</span>
            <Badge variant="warning">8</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Overdue</span>
            <Badge variant="error">3</Badge>
          </div>
        </div>
      </Card>

      {/* Feature Card */}
      <Card variant="outlined" padding="lg" interactive>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚀</div>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>New Feature</h3>
          <p style={{ margin: "0 0 1rem 0", color: "#6b7280" }}>
            Discover our latest AI-powered task suggestions
          </p>
          <Button variant="primary" size="sm">
            Learn More
          </Button>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Examples of cards with rich content including profiles, statistics, and features.",
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {/* Task Card */}
          <Card variant="default" padding="md" interactive>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <h4 style={{ margin: 0, fontSize: "1rem" }}>Complete project documentation</h4>
              <Badge priority="high" size="sm">High</Badge>
            </div>
            <p style={{ margin: "0 0 0.75rem 0", color: "#6b7280", fontSize: "0.875rem" }}>
              Write comprehensive documentation for the new feature
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Due: Tomorrow</span>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </Card>

          {/* Profile Summary */}
          <Card variant="elevated" padding="lg">
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "2rem",
                margin: "0 auto 0.5rem"
              }}>
                👤
              </div>
              <h3 style={{ margin: "0 0 0.25rem 0" }}>Sarah Wilson</h3>
              <p style={{ margin: 0, color: "#6b7280" }}>Product Manager</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#3b82f6" }}>42</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Tasks</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>38</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Done</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f59e0b" }}>4</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Pending</div>
              </div>
            </div>
          </Card>

          {/* AI Assistant Card */}
          <Card variant="glass" padding="lg">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "1.5rem" }}>🤖</div>
              <h3 style={{ margin: 0 }}>AI Assistant</h3>
            </div>
            <p style={{ margin: "0 0 1rem 0", color: "#374151" }}>
              I've analyzed your tasks and found 3 optimization opportunities.
            </p>
            <Button variant="primary" size="sm" fullWidth>
              View Suggestions
            </Button>
          </Card>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Dashboard Examples</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {/* Metric Cards */}
          <Card variant="default" padding="md">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Users</span>
              <span style={{ fontSize: "1.25rem" }}>👥</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>1,234</div>
            <div style={{ fontSize: "0.75rem", color: "#10b981" }}>+12% from last month</div>
          </Card>

          <Card variant="default" padding="md">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Revenue</span>
              <span style={{ fontSize: "1.25rem" }}>💰</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>$45.2K</div>
            <div style={{ fontSize: "0.75rem", color: "#10b981" }}>+8% from last month</div>
          </Card>

          <Card variant="default" padding="md">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Active Tasks</span>
              <span style={{ fontSize: "1.25rem" }}>📋</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}>89</div>
            <div style={{ fontSize: "0.75rem", color: "#ef4444" }}>-3% from last week</div>
          </Card>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world usage examples from Todo App and dashboard scenarios.",
      },
    },
  },
};

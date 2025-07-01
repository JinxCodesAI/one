/**
 * LoadingSpinner Component Stories
 * 
 * Comprehensive Storybook stories showcasing all LoadingSpinner variants,
 * sizes, colors, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSpinner } from "./LoadingSpinner.tsx";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Atoms/LoadingSpinner",
  component: LoadingSpinner,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The LoadingSpinner component provides a consistent loading indicator across applications.
It consolidates loading patterns from both AI Chat and Todo applications.

## Features
- Five sizes (xs, sm, md, lg, xl)
- Customizable colors
- Consistent animation
- Accessibility attributes
- Lightweight and performant
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Size of the spinner",
    },
    color: {
      control: { type: "color" },
      description: "Custom color for the spinner",
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS classes",
    },
  },
  args: {
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

// Basic variants
export const Default: Story = {
  args: {
    size: "md",
  },
};

export const CustomColor: Story = {
  args: {
    size: "md",
    color: "#10b981",
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="xs" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>XS</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="sm" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>SM</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="md" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>MD</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="lg" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>LG</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="xl" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>XL</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available spinner sizes from extra small (xs) to extra large (xl).",
      },
    },
  },
};

// Colors
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="md" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>Default</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="md" color="#ef4444" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>Red</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="md" color="#10b981" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>Green</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="md" color="#f59e0b" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>Orange</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="md" color="#8b5cf6" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>Purple</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <LoadingSpinner size="md" color="#6b7280" />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>Gray</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Spinners with different custom colors to match various contexts.",
      },
    },
  },
};

// Context Examples
export const InContext: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Button Loading */}
      <div>
        <h4 style={{ margin: "0 0 1rem 0" }}>In Buttons</h4>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "not-allowed",
              opacity: 0.7,
            }}
          >
            <LoadingSpinner size="sm" color="white" />
            Loading...
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "not-allowed",
              opacity: 0.7,
            }}
          >
            <LoadingSpinner size="sm" color="white" />
            Submitting
          </button>
        </div>
      </div>

      {/* Card Loading */}
      <div>
        <h4 style={{ margin: "0 0 1rem 0" }}>In Cards</h4>
        <div
          style={{
            padding: "2rem",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            textAlign: "center",
            width: "300px",
          }}
        >
          <LoadingSpinner size="lg" />
          <div style={{ marginTop: "1rem", color: "#6b7280" }}>
            Loading content...
          </div>
        </div>
      </div>

      {/* Inline Loading */}
      <div>
        <h4 style={{ margin: "0 0 1rem 0" }}>Inline Loading</h4>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LoadingSpinner size="xs" />
          <span style={{ color: "#6b7280" }}>Processing request...</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Examples of how the spinner appears in different UI contexts.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* AI Chat Loading */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>AI Chat Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* AI Thinking */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.5rem",
              width: "300px",
            }}
          >
            <LoadingSpinner size="sm" />
            <span style={{ color: "#374151" }}>AI is thinking...</span>
          </div>

          {/* Message Sending */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "0.5rem",
              width: "fit-content",
            }}
          >
            <LoadingSpinner size="xs" color="white" />
            <span>Sending...</span>
          </div>
        </div>
      </div>

      {/* Todo App Loading */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Todo App Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Task Creation */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "not-allowed",
              opacity: 0.8,
            }}
          >
            <LoadingSpinner size="sm" color="white" />
            Creating Task...
          </button>

          {/* Data Loading */}
          <div
            style={{
              padding: "2rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              textAlign: "center",
              width: "250px",
              backgroundColor: "#f9fafb",
            }}
          >
            <LoadingSpinner size="md" />
            <div style={{ marginTop: "1rem", color: "#6b7280" }}>
              Loading tasks...
            </div>
          </div>

          {/* AI Assistant */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              width: "280px",
            }}
          >
            <LoadingSpinner size="sm" color="#8b5cf6" />
            <span style={{ color: "#374151" }}>AI Assistant is analyzing...</span>
          </div>
        </div>
      </div>

      {/* Form Loading States */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Form Loading States</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "not-allowed",
              opacity: 0.8,
            }}
          >
            <LoadingSpinner size="sm" color="white" />
            Saving Changes...
          </button>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              cursor: "not-allowed",
            }}
          >
            <LoadingSpinner size="xs" />
            Validating...
          </button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world usage examples from AI Chat, Todo App, and common form scenarios.",
      },
    },
  },
};

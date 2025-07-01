/**
 * Textarea Component Stories
 * 
 * Comprehensive Storybook stories showcasing all Textarea variants,
 * auto-resize functionality, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea.tsx";

const meta: Meta<typeof Textarea> = {
  title: "Atoms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Textarea component is an auto-resizing textarea inspired by AI Chat's MessageInput
with validation states and consistent styling.

## Features
- Auto-resize functionality with configurable max height
- Error and success states
- Full width by default
- Focus management with visual feedback
- Comprehensive accessibility support
- Consistent styling with Input component
        `,
      },
    },
  },
  argTypes: {
    autoResize: {
      control: { type: "boolean" },
      description: "Enable auto-resize functionality",
    },
    maxHeight: {
      control: { type: "text" },
      description: "Maximum height when auto-resizing (CSS value)",
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
      description: "Makes textarea take full width of container",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the textarea",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    rows: {
      control: { type: "number" },
      description: "Initial number of rows (when not auto-resizing)",
    },
  },
  args: {
    placeholder: "Enter your message...",
    autoResize: false,
    maxHeight: "8rem",
    fullWidth: true,
    disabled: false,
    success: false,
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// Basic variants
export const Default: Story = {
  args: {
    placeholder: "Default textarea",
    rows: 4,
  },
};

export const AutoResize: Story = {
  args: {
    placeholder: "Type here and watch it grow...",
    autoResize: true,
    maxHeight: "8rem",
  },
  parameters: {
    docs: {
      description: {
        story: "Auto-resizing textarea that grows with content up to the maximum height.",
      },
    },
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Textarea with error",
    error: "Message is required",
    value: "",
  },
};

export const Success: Story = {
  args: {
    placeholder: "Valid textarea",
    success: true,
    value: "This is a valid message that meets all requirements.",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
    value: "This content cannot be edited",
  },
};

// Auto-resize Examples
export const AutoResizeExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "400px" }}>
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Auto-resize with 6rem max height</h4>
        <Textarea
          autoResize
          maxHeight="6rem"
          placeholder="Type a long message to see auto-resize in action..."
        />
      </div>
      
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Auto-resize with 10rem max height</h4>
        <Textarea
          autoResize
          maxHeight="10rem"
          placeholder="This one can grow taller..."
        />
      </div>
      
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Fixed height (no auto-resize)</h4>
        <Textarea
          autoResize={false}
          rows={3}
          placeholder="Fixed height textarea"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different auto-resize configurations with various maximum heights.",
      },
    },
  },
};

// States Showcase
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "400px" }}>
      <Textarea placeholder="Normal state" rows={3} />
      <Textarea 
        placeholder="Success state" 
        success 
        value="This message looks good!" 
        rows={3}
      />
      <Textarea 
        placeholder="Error state" 
        error="Message is too short" 
        value="Hi"
        rows={3}
      />
      <Textarea 
        placeholder="Disabled state" 
        disabled 
        value="Cannot edit this message"
        rows={3}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All possible textarea states: normal, success, error, and disabled.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* AI Chat Message Input */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>AI Chat Message Input</h3>
        <div style={{ width: "500px" }}>
          <Textarea
            autoResize
            maxHeight="8rem"
            placeholder="Type your message to the AI assistant..."
          />
        </div>
      </div>

      {/* Todo Description */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Todo Description</h3>
        <div style={{ width: "400px" }}>
          <Textarea
            autoResize
            maxHeight="6rem"
            placeholder="Add a description for your task..."
          />
        </div>
      </div>

      {/* Comment/Feedback Form */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Comment Form</h3>
        <div style={{ width: "450px" }}>
          <Textarea
            autoResize={false}
            rows={4}
            placeholder="Leave your feedback or comments here..."
          />
        </div>
      </div>

      {/* Code/Notes Input */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Notes/Code Input</h3>
        <div style={{ width: "500px" }}>
          <Textarea
            autoResize
            maxHeight="12rem"
            placeholder="Add your notes, code snippets, or detailed information..."
            style={{ fontFamily: "monospace" }}
          />
        </div>
      </div>

      {/* Validation Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Validation Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "400px" }}>
          <Textarea
            autoResize
            maxHeight="6rem"
            value="This is a well-written message that meets all the requirements for length and content quality."
            success
            placeholder="Valid message"
          />
          <Textarea
            autoResize
            maxHeight="6rem"
            value="Too short"
            error="Message must be at least 20 characters long"
            placeholder="Message with validation error"
          />
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

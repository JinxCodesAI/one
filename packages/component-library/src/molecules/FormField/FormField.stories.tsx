/**
 * FormField Component Stories
 * 
 * Comprehensive Storybook stories showcasing FormField composition
 * with various input types and validation states.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField.tsx";
import { Input } from "../../atoms/Input/Input.tsx";
import { Textarea } from "../../atoms/Textarea/Textarea.tsx";

const meta: Meta<typeof FormField> = {
  title: "Molecules/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The FormField component provides a complete form field composition with label, input element, 
and error/help text. It ensures consistent form styling and accessibility across applications.

## Features
- Label with required indicator
- Error message display with ARIA attributes
- Help text support
- Success state indication
- Accessibility compliant (proper ARIA relationships)
- Works with any input-like component (Input, Textarea, Select, etc.)
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: { type: "text" },
      description: "Field label text",
    },
    required: {
      control: { type: "boolean" },
      description: "Whether the field is required",
    },
    error: {
      control: { type: "text" },
      description: "Error message to display",
    },
    helpText: {
      control: { type: "text" },
      description: "Help text to display below the field",
    },
    success: {
      control: { type: "boolean" },
      description: "Success state styling",
    },
  },
  args: {
    label: "Field Label",
    required: false,
    success: false,
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

// Basic examples
export const Default: Story = {
  args: {
    label: "Email Address",
    children: <Input type="email" placeholder="your@email.com" fullWidth />,
  },
};

export const Required: Story = {
  args: {
    label: "Full Name",
    required: true,
    children: <Input type="text" placeholder="Enter your full name" fullWidth />,
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    required: true,
    error: "Password must be at least 8 characters long",
    children: <Input type="password" placeholder="Enter password" fullWidth />,
  },
};

export const WithSuccess: Story = {
  args: {
    label: "Username",
    success: true,
    children: <Input type="text" value="john_doe" fullWidth />,
  },
};

export const WithHelpText: Story = {
  args: {
    label: "API Key",
    helpText: "You can find your API key in your account settings",
    children: <Input type="text" placeholder="sk-..." fullWidth />,
  },
};

// Different Input Types
export const InputTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "400px" }}>
      <FormField label="Text Input" required>
        <Input type="text" placeholder="Enter text" fullWidth />
      </FormField>
      
      <FormField label="Email Input" required>
        <Input type="email" placeholder="your@email.com" fullWidth />
      </FormField>
      
      <FormField label="Password Input" required>
        <Input type="password" placeholder="Enter password" fullWidth />
      </FormField>
      
      <FormField label="Number Input">
        <Input type="number" placeholder="Enter number" fullWidth />
      </FormField>
      
      <FormField label="Phone Input">
        <Input type="tel" placeholder="+1 (555) 123-4567" fullWidth />
      </FormField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "FormField works with different input types while maintaining consistent styling.",
      },
    },
  },
};

// With Textarea
export const WithTextarea: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "400px" }}>
      <FormField 
        label="Description" 
        helpText="Provide a detailed description of your task"
      >
        <Textarea 
          placeholder="Enter description..." 
          autoResize 
          maxHeight="8rem" 
        />
      </FormField>
      
      <FormField 
        label="Comments" 
        required
        error="Comments are required for this action"
      >
        <Textarea 
          placeholder="Add your comments..." 
          rows={4}
        />
      </FormField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "FormField composition with Textarea components for longer text input.",
      },
    },
  },
};

// Validation States
export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "400px" }}>
      <FormField label="Valid Field" success>
        <Input type="email" value="user@example.com" fullWidth />
      </FormField>
      
      <FormField 
        label="Field with Error" 
        required
        error="This field is required"
      >
        <Input type="text" value="" fullWidth />
      </FormField>
      
      <FormField 
        label="Field with Help Text"
        helpText="This information will help us personalize your experience"
      >
        <Input type="text" placeholder="Optional information" fullWidth />
      </FormField>
      
      <FormField 
        label="Normal Field"
      >
        <Input type="text" placeholder="Enter value" fullWidth />
      </FormField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different validation states: success, error, help text, and normal.",
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "400px" }}>
      <FormField label="Search" helpText="Search across all your content">
        <Input leftIcon="🔍" placeholder="Search..." fullWidth />
      </FormField>
      
      <FormField label="Email Address" required>
        <Input 
          type="email" 
          leftIcon="📧" 
          placeholder="your@email.com" 
          fullWidth 
        />
      </FormField>
      
      <FormField label="Password" required>
        <Input 
          type="password" 
          leftIcon="🔒" 
          rightIcon="👁️" 
          placeholder="Enter password" 
          fullWidth 
        />
      </FormField>
      
      <FormField 
        label="Website URL" 
        success
      >
        <Input 
          type="url" 
          leftIcon="🌐" 
          rightIcon="✓" 
          value="https://example.com" 
          fullWidth 
        />
      </FormField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "FormField with Input components that include left and right icons.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Todo App Form */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Todo App Task Form</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "400px" }}>
          <FormField label="Task Title" required>
            <Input type="text" placeholder="What needs to be done?" fullWidth />
          </FormField>
          
          <FormField 
            label="Description" 
            helpText="Add more details about this task"
          >
            <Textarea 
              placeholder="Describe the task..." 
              autoResize 
              maxHeight="6rem" 
            />
          </FormField>
          
          <FormField label="Due Date">
            <Input type="date" fullWidth />
          </FormField>
        </div>
      </div>

      {/* User Profile Form */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>User Profile Form</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "400px" }}>
          <FormField label="Full Name" required>
            <Input 
              type="text" 
              leftIcon="👤" 
              placeholder="John Doe" 
              fullWidth 
            />
          </FormField>
          
          <FormField label="Email Address" required>
            <Input 
              type="email" 
              leftIcon="📧" 
              placeholder="john@example.com" 
              fullWidth 
            />
          </FormField>
          
          <FormField 
            label="Phone Number" 
            helpText="We'll only use this for account security"
          >
            <Input 
              type="tel" 
              leftIcon="📞" 
              placeholder="+1 (555) 123-4567" 
              fullWidth 
            />
          </FormField>
          
          <FormField label="Bio">
            <Textarea 
              placeholder="Tell us about yourself..." 
              autoResize 
              maxHeight="8rem" 
            />
          </FormField>
        </div>
      </div>

      {/* Contact Form */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Contact Form</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "400px" }}>
          <FormField label="Subject" required>
            <Input type="text" placeholder="How can we help?" fullWidth />
          </FormField>
          
          <FormField 
            label="Message" 
            required
            helpText="Please provide as much detail as possible"
          >
            <Textarea 
              placeholder="Your message..." 
              autoResize 
              maxHeight="10rem" 
            />
          </FormField>
          
          <FormField 
            label="Priority Level"
            helpText="Help us prioritize your request"
          >
            <Input type="text" placeholder="Normal" fullWidth />
          </FormField>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world form examples from Todo App and common application scenarios.",
      },
    },
  },
};

/**
 * Alert Component Stories
 * 
 * Comprehensive Storybook stories showcasing all Alert variants,
 * types, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert.tsx";

const meta: Meta<typeof Alert> = {
  title: "Molecules/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Alert component provides unified error handling and notification patterns
from both applications with support for different types, variants, and actions.

## Features
- Four semantic types (info, success, warning, error)
- Three visual variants (banner, card, toast)
- Dismissible with close button
- Retry functionality for error alerts
- Custom icons support
- Accessible with proper ARIA attributes
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["info", "success", "warning", "error"],
      description: "Alert semantic type",
    },
    variant: {
      control: { type: "select" },
      options: ["banner", "card", "toast"],
      description: "Visual variant of the alert",
    },
    title: {
      control: { type: "text" },
      description: "Alert title (optional)",
    },
    message: {
      control: { type: "text" },
      description: "Alert message content",
    },
    dismissible: {
      control: { type: "boolean" },
      description: "Show close button",
    },
    icon: {
      control: { type: "text" },
      description: "Custom icon (emoji or text)",
    },
  },
  args: {
    message: "This is an alert message",
    type: "info",
    variant: "banner",
    dismissible: true,
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Basic types
export const Info: Story = {
  args: {
    type: "info",
    message: "This is an informational message",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    message: "Operation completed successfully!",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    message: "Please review your settings before continuing",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    message: "An error occurred while processing your request",
  },
};

// All Types
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
      <Alert type="info" message="This is an informational message" />
      <Alert type="success" message="Operation completed successfully!" />
      <Alert type="warning" message="Please review your settings" />
      <Alert type="error" message="An error occurred" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available alert types with their semantic colors and default icons.",
      },
    },
  },
};

// Variants
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h4 style={{ margin: "0 0 1rem 0" }}>Banner Variant</h4>
        <Alert 
          variant="banner" 
          type="warning" 
          message="This is a banner alert that spans the full width" 
        />
      </div>
      
      <div>
        <h4 style={{ margin: "0 0 1rem 0" }}>Card Variant</h4>
        <Alert 
          variant="card" 
          type="success" 
          title="Success!"
          message="This is a card alert with shadow and rounded corners" 
        />
      </div>
      
      <div>
        <h4 style={{ margin: "0 0 1rem 0" }}>Toast Variant</h4>
        <Alert 
          variant="toast" 
          type="error" 
          title="Error"
          message="This is a toast alert for notifications" 
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Three visual variants: banner (full-width), card (contained), and toast (notification-style).",
      },
    },
  },
};

// With Titles
export const WithTitles: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
      <Alert 
        type="info" 
        title="Information" 
        message="Here's some important information you should know" 
      />
      <Alert 
        type="success" 
        title="Well done!" 
        message="You have successfully completed the task" 
      />
      <Alert 
        type="warning" 
        title="Heads up!" 
        message="This action cannot be undone" 
      />
      <Alert 
        type="error" 
        title="Something went wrong" 
        message="We encountered an error while processing your request" 
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Alerts with titles for more structured messaging.",
      },
    },
  },
};

// With Actions
export const WithActions: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
      <Alert 
        type="error" 
        title="Connection Failed" 
        message="Unable to connect to the server. Please try again." 
        onRetry={() => alert("Retry clicked")}
        onClose={() => alert("Close clicked")}
      />
      <Alert 
        type="warning" 
        message="Your session will expire in 5 minutes" 
        onClose={() => alert("Dismissed")}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Alerts with action buttons like retry and close functionality.",
      },
    },
  },
};

// Custom Icons
export const CustomIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
      <Alert 
        type="info" 
        icon="🔔" 
        message="You have a new notification" 
      />
      <Alert 
        type="success" 
        icon="🎉" 
        message="Congratulations on your achievement!" 
      />
      <Alert 
        type="warning" 
        icon="⚡" 
        message="High server load detected" 
      />
      <Alert 
        type="error" 
        icon="🚨" 
        message="Security alert: Unusual activity detected" 
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Alerts with custom icons to better represent the message context.",
      },
    },
  },
};

// Non-dismissible
export const NonDismissible: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
      <Alert 
        type="warning" 
        message="This alert cannot be dismissed" 
        dismissible={false}
      />
      <Alert 
        type="info" 
        title="System Maintenance" 
        message="Scheduled maintenance in progress. Please save your work." 
        dismissible={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Alerts that cannot be dismissed, useful for critical system messages.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* AI Chat Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>AI Chat Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
          <Alert 
            type="error" 
            variant="card"
            title="Connection Error" 
            message="Failed to connect to AI service. Please check your internet connection." 
            onRetry={() => alert("Retrying connection...")}
            onClose={() => alert("Error dismissed")}
          />
          <Alert 
            type="warning" 
            variant="banner"
            message="AI responses may take longer than usual due to high demand" 
            dismissible={false}
          />
          <Alert 
            type="success" 
            variant="toast"
            message="Message sent successfully!" 
          />
        </div>
      </div>

      {/* Todo App Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Todo App Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
          <Alert 
            type="success" 
            variant="banner"
            icon="✅"
            title="Task Completed!" 
            message="Great job! You've completed all your tasks for today." 
          />
          <Alert 
            type="warning" 
            variant="card"
            title="Overdue Tasks" 
            message="You have 3 tasks that are past their due date" 
          />
          <Alert 
            type="error" 
            variant="toast"
            message="Failed to save task. Please try again." 
            onRetry={() => alert("Retrying save...")}
          />
          <Alert 
            type="info" 
            variant="card"
            icon="🤖"
            title="AI Assistant" 
            message="I've analyzed your tasks and have some suggestions for better organization." 
          />
        </div>
      </div>

      {/* Form Validation Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Form Validation Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
          <Alert 
            type="error" 
            variant="banner"
            title="Form Validation Failed" 
            message="Please correct the errors below and try again" 
            dismissible={false}
          />
          <Alert 
            type="success" 
            variant="card"
            title="Profile Updated" 
            message="Your profile information has been saved successfully" 
          />
          <Alert 
            type="warning" 
            variant="card"
            title="Unsaved Changes" 
            message="You have unsaved changes. Are you sure you want to leave?" 
          />
        </div>
      </div>

      {/* System Status Examples */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>System Status Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "500px" }}>
          <Alert 
            type="info" 
            variant="banner"
            icon="🔧"
            title="Maintenance Mode" 
            message="System will be under maintenance from 2:00 AM to 4:00 AM UTC" 
            dismissible={false}
          />
          <Alert 
            type="warning" 
            variant="toast"
            icon="⚡"
            message="High server load - some features may be slower" 
          />
          <Alert 
            type="success" 
            variant="banner"
            icon="🎉"
            title="New Features Available!" 
            message="Check out the latest updates in your dashboard" 
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world usage examples from AI Chat, Todo App, and common application scenarios.",
      },
    },
  },
};

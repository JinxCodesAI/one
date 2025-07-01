/**
 * Modal Component Stories
 * 
 * Comprehensive Storybook stories showcasing all Modal variants,
 * sizes, and usage examples.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal.tsx";
import { Button } from "../../atoms/Button/Button.tsx";
import { FormField } from "../../molecules/FormField/FormField.tsx";
import { Input } from "../../atoms/Input/Input.tsx";
import { Textarea } from "../../atoms/Textarea/Textarea.tsx";
import React from "react";

const meta: Meta<typeof Modal> = {
  title: "Organisms/Modal",
  component: Modal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The Modal component provides an accessible dialog system based on Todo App's modal patterns
with comprehensive keyboard navigation and focus management.

## Features
- Five sizes (sm, md, lg, xl, full)
- Accessibility compliant (focus management, keyboard navigation)
- Close on overlay click/escape key
- Header with title and close button
- Footer support for actions
- Animations and mobile responsive
- Proper ARIA attributes
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: { type: "boolean" },
      description: "Whether modal is open",
    },
    title: {
      control: { type: "text" },
      description: "Modal title",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Modal size",
    },
    showCloseButton: {
      control: { type: "boolean" },
      description: "Show close button in header",
    },
    closeOnOverlayClick: {
      control: { type: "boolean" },
      description: "Close when clicking overlay",
    },
    closeOnEscape: {
      control: { type: "boolean" },
      description: "Close when pressing escape key",
    },
  },
  args: {
    isOpen: true,
    title: "Modal Title",
    size: "md",
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEscape: true,
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Basic Modal
export const Default: Story = {
  args: {
    title: "Default Modal",
    children: (
      <div>
        <p>This is a basic modal with default settings.</p>
        <p>It includes a title, content area, and close functionality.</p>
      </div>
    ),
  },
};

// Modal Sizes
export const Sizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = React.useState<string | null>(null);
    
    return (
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", padding: "2rem" }}>
        <Button onClick={() => setOpenModal("sm")}>Small Modal</Button>
        <Button onClick={() => setOpenModal("md")}>Medium Modal</Button>
        <Button onClick={() => setOpenModal("lg")}>Large Modal</Button>
        <Button onClick={() => setOpenModal("xl")}>Extra Large Modal</Button>
        <Button onClick={() => setOpenModal("full")}>Full Screen Modal</Button>

        <Modal
          isOpen={openModal === "sm"}
          onClose={() => setOpenModal(null)}
          title="Small Modal"
          size="sm"
        >
          <p>This is a small modal, perfect for simple confirmations or alerts.</p>
        </Modal>

        <Modal
          isOpen={openModal === "md"}
          onClose={() => setOpenModal(null)}
          title="Medium Modal"
          size="md"
        >
          <p>This is a medium modal, good for forms and detailed content.</p>
          <p>It provides a balanced amount of space for most use cases.</p>
        </Modal>

        <Modal
          isOpen={openModal === "lg"}
          onClose={() => setOpenModal(null)}
          title="Large Modal"
          size="lg"
        >
          <p>This is a large modal with more space for complex content.</p>
          <p>It's suitable for detailed forms, data tables, or rich content.</p>
          <p>The larger size allows for better organization of information.</p>
        </Modal>

        <Modal
          isOpen={openModal === "xl"}
          onClose={() => setOpenModal(null)}
          title="Extra Large Modal"
          size="xl"
        >
          <p>This is an extra large modal for very complex interfaces.</p>
          <p>It provides maximum space while still maintaining the modal context.</p>
          <p>Perfect for dashboards, complex forms, or detailed data views.</p>
          <p>The content can be quite extensive without feeling cramped.</p>
        </Modal>

        <Modal
          isOpen={openModal === "full"}
          onClose={() => setOpenModal(null)}
          title="Full Screen Modal"
          size="full"
        >
          <p>This is a full screen modal that takes up most of the viewport.</p>
          <p>It's ideal for immersive experiences or when you need maximum space.</p>
          <p>Perfect for complex workflows, detailed editors, or comprehensive views.</p>
          <p>The full screen approach provides an app-like experience within the modal.</p>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Different modal sizes from small confirmations to full-screen experiences.",
      },
    },
  },
};

// With Footer Actions
export const WithFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
      <div style={{ padding: "2rem" }}>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Footer</Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p>Are you sure you want to perform this action?</p>
          <p>This action cannot be undone and will permanently delete the selected items.</p>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Modal with footer actions for confirmations and form submissions.",
      },
    },
  },
};

// Form Modal
export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({
      title: "",
      description: "",
      priority: "",
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Form submitted: ${JSON.stringify(formData, null, 2)}`);
      setIsOpen(false);
    };
    
    return (
      <div style={{ padding: "2rem" }}>
        <Button onClick={() => setIsOpen(true)}>Create New Task</Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New Task"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" form="task-form">
                Create Task
              </Button>
            </>
          }
        >
          <form id="task-form" onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FormField label="Task Title" required>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What needs to be done?"
                  fullWidth
                />
              </FormField>
              
              <FormField label="Description">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add more details..."
                  autoResize
                  maxHeight="8rem"
                />
              </FormField>
              
              <FormField label="Priority">
                <Input
                  type="text"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  placeholder="High, Medium, or Low"
                  fullWidth
                />
              </FormField>
            </div>
          </form>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Modal containing a form with proper submission handling.",
      },
    },
  },
};

// Confirmation Modal
export const ConfirmationModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
      <div style={{ padding: "2rem" }}>
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete Confirmation"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  alert("Item deleted!");
                  setIsOpen(false);
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete this item?</p>
          <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>
            This action cannot be undone.
          </p>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Small confirmation modal for destructive actions.",
      },
    },
  },
};

// No Close Button
export const NoCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
      <div style={{ padding: "2rem" }}>
        <Button onClick={() => setIsOpen(true)}>Open Modal (No Close Button)</Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Important Notice"
          size="md"
          showCloseButton={false}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          footer={
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              I Understand
            </Button>
          }
        >
          <p>This is an important notice that requires your attention.</p>
          <p>You must acknowledge this message before continuing.</p>
          <p>The modal cannot be dismissed by clicking outside or pressing escape.</p>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Modal that requires explicit user action to close.",
      },
    },
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => {
    const [openModal, setOpenModal] = React.useState<string | null>(null);
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "2rem" }}>
        {/* Todo App Examples */}
        <div>
          <h3 style={{ margin: "0 0 1rem 0" }}>Todo App Examples</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button onClick={() => setOpenModal("todo-form")}>Add Task</Button>
            <Button onClick={() => setOpenModal("ai-assistant")}>AI Assistant</Button>
            <Button onClick={() => setOpenModal("task-details")}>Task Details</Button>
          </div>
        </div>

        {/* AI Chat Examples */}
        <div>
          <h3 style={{ margin: "0 0 1rem 0" }}>AI Chat Examples</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button onClick={() => setOpenModal("settings")}>Settings</Button>
            <Button onClick={() => setOpenModal("model-selector")}>Select Model</Button>
            <Button onClick={() => setOpenModal("export-chat")}>Export Chat</Button>
          </div>
        </div>

        {/* Todo Form Modal */}
        <Modal
          isOpen={openModal === "todo-form"}
          onClose={() => setOpenModal(null)}
          title="Add New Task"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
              <Button variant="primary">Create Task</Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FormField label="Title" required>
              <Input placeholder="What needs to be done?" fullWidth />
            </FormField>
            <FormField label="Description">
              <Textarea placeholder="Add details..." autoResize maxHeight="6rem" />
            </FormField>
            <FormField label="Due Date">
              <Input type="date" fullWidth />
            </FormField>
          </div>
        </Modal>

        {/* AI Assistant Modal */}
        <Modal
          isOpen={openModal === "ai-assistant"}
          onClose={() => setOpenModal(null)}
          title="AI Task Assistant"
          size="lg"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ 
              padding: "1rem", 
              backgroundColor: "#f3f4f6", 
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <span style={{ fontSize: "1.5rem" }}>🤖</span>
              <div>
                <p style={{ margin: "0 0 0.25rem 0", fontWeight: "500" }}>AI Suggestions</p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                  Based on your task history, here are some optimizations
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                <p style={{ margin: "0 0 0.25rem 0", fontWeight: "500" }}>Prioritize urgent tasks</p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                  You have 3 overdue tasks that need immediate attention
                </p>
              </div>
              <div style={{ padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                <p style={{ margin: "0 0 0.25rem 0", fontWeight: "500" }}>Break down large tasks</p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                  Consider splitting "Complete project" into smaller, manageable tasks
                </p>
              </div>
            </div>
          </div>
        </Modal>

        {/* Settings Modal */}
        <Modal
          isOpen={openModal === "settings"}
          onClose={() => setOpenModal(null)}
          title="Chat Settings"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
              <Button variant="primary">Save Settings</Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FormField label="AI Model">
              <Input value="GPT-4" fullWidth />
            </FormField>
            <FormField label="Temperature" helpText="Controls randomness (0-1)">
              <Input type="number" value="0.7" min="0" max="1" step="0.1" fullWidth />
            </FormField>
            <FormField label="Max Tokens">
              <Input type="number" value="2048" fullWidth />
            </FormField>
          </div>
        </Modal>

        {/* Export Modal */}
        <Modal
          isOpen={openModal === "export-chat"}
          onClose={() => setOpenModal(null)}
          title="Export Chat History"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
              <Button variant="primary">Export</Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p>Choose export format:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="radio" name="format" value="json" defaultChecked />
                JSON Format
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="radio" name="format" value="txt" />
                Plain Text
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="radio" name="format" value="md" />
                Markdown
              </label>
            </div>
          </div>
        </Modal>

        {/* Other modals... */}
        <Modal
          isOpen={openModal === "task-details"}
          onClose={() => setOpenModal(null)}
          title="Task Details"
          size="lg"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Complete project documentation</h4>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <span style={{ 
                  padding: "0.25rem 0.5rem", 
                  backgroundColor: "#ef4444", 
                  color: "white", 
                  borderRadius: "0.25rem", 
                  fontSize: "0.75rem" 
                }}>
                  High Priority
                </span>
                <span style={{ 
                  padding: "0.25rem 0.5rem", 
                  backgroundColor: "#f59e0b", 
                  color: "white", 
                  borderRadius: "0.25rem", 
                  fontSize: "0.75rem" 
                }}>
                  Overdue
                </span>
              </div>
              <p style={{ color: "#6b7280" }}>
                Write comprehensive documentation for the new feature including API references, 
                user guides, and implementation examples.
              </p>
            </div>
            <div>
              <h5 style={{ margin: "0 0 0.5rem 0" }}>Subtasks</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" checked readOnly />
                  API documentation
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" readOnly />
                  User guide
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" readOnly />
                  Code examples
                </label>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={openModal === "model-selector"}
          onClose={() => setOpenModal(null)}
          title="Select AI Model"
          size="md"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ 
                padding: "1rem", 
                border: "2px solid #3b82f6", 
                borderRadius: "0.5rem",
                backgroundColor: "#eff6ff"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h4 style={{ margin: 0 }}>GPT-4</h4>
                  <span style={{ 
                    padding: "0.25rem 0.5rem", 
                    backgroundColor: "#3b82f6", 
                    color: "white", 
                    borderRadius: "0.25rem", 
                    fontSize: "0.75rem" 
                  }}>
                    Current
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                  Most capable model, best for complex reasoning
                </p>
              </div>
              
              <div style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>Claude 3</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                  Great for analysis and creative writing
                </p>
              </div>
              
              <div style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>Gemini Pro</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                  Fast responses, good for general tasks
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Real-world modal examples from Todo App and AI Chat applications.",
      },
    },
  },
};

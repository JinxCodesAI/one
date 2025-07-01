/**
 * Component Showcase Stories
 * 
 * Comprehensive showcase of all components working together
 * in real-world scenarios and layouts.
 */

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  Button,
  Input,
  Textarea,
  LoadingSpinner,
  Badge,
  FormField,
  Alert,
  Card,
  Modal,
} from "../src/index.ts";

const meta: Meta = {
  title: "Examples/Component Showcase",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
This showcase demonstrates how all components work together in real-world scenarios,
showing the cohesive design system and consistent interactions across the library.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Complete Application Example
export const CompleteApplication: Story = {
  render: () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [showAlert, setShowAlert] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
      title: "",
      description: "",
      priority: "medium",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setIsModalOpen(false);
        setShowAlert(true);
        setFormData({ title: "", description: "", priority: "medium" });
      }, 2000);
    };

    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>
              Task Manager
            </h1>
            <Badge variant="primary" size="sm">v2.0</Badge>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Input
              leftIcon="🔍"
              placeholder="Search tasks..."
              size="sm"
              style={{ width: "200px" }}
            />
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add Task
            </Button>
          </div>
        </header>

        {/* Alert */}
        {showAlert && (
          <Alert
            type="success"
            variant="banner"
            title="Success!"
            message="Task created successfully"
            dismissible
            onClose={() => setShowAlert(false)}
          />
        )}

        {/* Main Content */}
        <main style={{ padding: "2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}>
            {/* Sidebar */}
            <aside>
              <Card variant="default" padding="lg">
                <h3 style={{ margin: "0 0 1rem 0" }}>Quick Stats</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Total Tasks</span>
                    <Badge variant="info">24</Badge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Completed</span>
                    <Badge variant="success">18</Badge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>In Progress</span>
                    <Badge variant="warning">4</Badge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Overdue</span>
                    <Badge variant="error">2</Badge>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="lg" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>🤖</span>
                  <h3 style={{ margin: 0 }}>AI Assistant</h3>
                </div>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: "#6b7280" }}>
                  Get smart suggestions for task prioritization and time management.
                </p>
                <Button variant="secondary" size="sm" fullWidth>
                  Get Suggestions
                </Button>
              </Card>
            </aside>

            {/* Task List */}
            <section>
              <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0 }}>Recent Tasks</h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="ghost" size="sm">Active</Button>
                  <Button variant="ghost" size="sm">Completed</Button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Task Cards */}
                <Card variant="default" padding="md" interactive>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem" }}>Complete project documentation</h4>
                    <Badge priority="high" size="sm">High</Badge>
                  </div>
                  <p style={{ margin: "0 0 0.75rem 0", color: "#6b7280", fontSize: "0.875rem" }}>
                    Write comprehensive documentation for the new feature including API references and examples.
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Due: Tomorrow</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="primary" size="sm">Complete</Button>
                    </div>
                  </div>
                </Card>

                <Card variant="default" padding="md" interactive>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem" }}>Review pull requests</h4>
                    <Badge priority="medium" size="sm">Medium</Badge>
                  </div>
                  <p style={{ margin: "0 0 0.75rem 0", color: "#6b7280", fontSize: "0.875rem" }}>
                    Review and provide feedback on pending pull requests from the team.
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Due: Friday</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="primary" size="sm">Complete</Button>
                    </div>
                  </div>
                </Card>

                <Card variant="default" padding="md" interactive>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem" }}>Update dependencies</h4>
                    <Badge priority="low" size="sm">Low</Badge>
                  </div>
                  <p style={{ margin: "0 0 0.75rem 0", color: "#6b7280", fontSize: "0.875rem" }}>
                    Update project dependencies to latest stable versions and test compatibility.
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Due: Next week</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="primary" size="sm">Complete</Button>
                    </div>
                  </div>
                </Card>

                {/* Loading State */}
                <Card variant="outlined" padding="lg">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                    <LoadingSpinner size="sm" />
                    <span style={{ color: "#6b7280" }}>Loading more tasks...</span>
                  </div>
                </Card>
              </div>
            </section>
          </div>
        </main>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Task"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                form="task-form"
                loading={isLoading}
              >
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
        story: "Complete application example showing all components working together in a task management interface.",
      },
    },
  },
};

/**
 * Example Application
 * 
 * Demonstrates how to use the component library in a real application
 * showcasing various components and patterns.
 */

import React, { useState } from "react";
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
  createTheme,
  colors,
  spacing,
} from "../src/index.ts";

// Custom theme example
const exampleTheme = createTheme({
  colors: {
    primary: {
      500: "#6366f1", // Indigo
      600: "#4f46e5",
    },
  },
});

export function ExampleApp(): React.ReactElement {
  // State for various examples
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setAlertType("success");
      setShowAlert(true);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", message: "" });
    }, 2000);
  };

  const handleError = () => {
    setAlertType("error");
    setShowAlert(true);
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: colors.background.secondary,
      padding: spacing[4] 
    }}>
      {/* Header */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing[6] }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <h1 style={{ 
            margin: 0, 
            color: colors.text.primary,
            fontSize: "2rem",
            fontWeight: "bold"
          }}>
            Component Library Example
          </h1>
          <div style={{ display: "flex", gap: spacing[2], alignItems: "center" }}>
            <Badge variant="primary">v1.0.0</Badge>
            <Badge priority="high">Live</Badge>
          </div>
        </div>
      </Card>

      {/* Alert Example */}
      {showAlert && (
        <Alert
          type={alertType}
          variant="banner"
          title={alertType === "success" ? "Success!" : "Error occurred"}
          message={
            alertType === "success" 
              ? "Your form has been submitted successfully."
              : "Something went wrong. Please try again."
          }
          dismissible
          onClose={() => setShowAlert(false)}
          onRetry={alertType === "error" ? () => setShowAlert(false) : undefined}
        />
      )}

      {/* Main Content Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: spacing[6],
        marginTop: spacing[4]
      }}>
        
        {/* Buttons Example */}
        <Card variant="default" padding="lg">
          <h2 style={{ marginTop: 0, color: colors.text.primary }}>
            Button Examples
          </h2>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: spacing[3] 
          }}>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            <Button variant="secondary" icon="⚙️">
              Settings
            </Button>
            <Button variant="outline" size="sm">
              Small Outline
            </Button>
            <Button variant="danger" icon="🗑️" iconPosition="right">
              Delete Item
            </Button>
            <Button variant="ghost" loading={isLoading}>
              Loading Button
            </Button>
          </div>
        </Card>

        {/* Form Elements Example */}
        <Card variant="default" padding="lg">
          <h2 style={{ marginTop: 0, color: colors.text.primary }}>
            Form Elements
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
            <FormField label="Search" helpText="Enter keywords to search">
              <Input
                type="text"
                placeholder="Search..."
                leftIcon="🔍"
                fullWidth
              />
            </FormField>
            
            <FormField label="Email" required>
              <Input
                type="email"
                placeholder="your@email.com"
                fullWidth
              />
            </FormField>

            <FormField label="Message">
              <Textarea
                placeholder="Enter your message..."
                autoResize
                maxHeight="6rem"
              />
            </FormField>
          </div>
        </Card>

        {/* Status and Loading Example */}
        <Card variant="glass" padding="lg">
          <h2 style={{ marginTop: 0, color: colors.text.primary }}>
            Status & Loading
          </h2>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: spacing[4],
            alignItems: "flex-start"
          }}>
            <div style={{ display: "flex", gap: spacing[2], flexWrap: "wrap" }}>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Failed</Badge>
              <Badge priority="high">High Priority</Badge>
              <Badge priority="medium">Medium</Badge>
              <Badge priority="low">Low</Badge>
            </div>

            <div style={{ display: "flex", gap: spacing[3], alignItems: "center" }}>
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
            </div>

            <Button 
              variant="outline" 
              onClick={handleError}
              icon="⚠️"
            >
              Trigger Error
            </Button>
          </div>
        </Card>

        {/* Interactive Cards Example */}
        <Card variant="outlined" padding="lg">
          <h2 style={{ marginTop: 0, color: colors.text.primary }}>
            Interactive Elements
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
            <Card 
              variant="elevated" 
              padding="md" 
              interactive
              onClick={() => alert("Card clicked!")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Clickable Card</span>
                <Badge variant="info">Click me</Badge>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Static Card</span>
                <Badge variant="secondary">Read-only</Badge>
              </div>
            </Card>
          </div>
        </Card>
      </div>

      {/* Modal Example */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Contact Form"
        size="md"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              form="contact-form"
              loading={isLoading}
            >
              Submit
            </Button>
          </>
        }
      >
        <form id="contact-form" onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
            <FormField label="Name" required>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your name"
                fullWidth
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                fullWidth
              />
            </FormField>

            <FormField label="Message" required>
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Your message..."
                autoResize
                maxHeight="8rem"
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
}

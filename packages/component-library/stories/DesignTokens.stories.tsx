/**
 * Design Tokens Stories
 * 
 * Comprehensive showcase of all design tokens including colors,
 * typography, spacing, borders, and breakpoints.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { colors, typography, spacing, borders, shadows, breakpoints } from "../src/tokens/index.ts";

const meta: Meta = {
  title: "Design System/Design Tokens",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Design tokens are the foundation of our design system. They provide consistent values
for colors, typography, spacing, borders, and other visual properties across all components.

## Token Categories
- **Colors**: Semantic color system with variants
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: 8px-based spacing scale
- **Borders**: Border radius, width, and shadow tokens
- **Breakpoints**: Responsive design breakpoints
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Colors
export const Colors: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Color Palette</h2>
      
      {/* Primary Colors */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Primary Colors</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.entries(colors.primary).map(([shade, color]) => (
            <div key={shade} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: color,
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              />
              <div style={{ fontSize: "0.75rem", fontWeight: "500" }}>{shade}</div>
              <div style={{ fontSize: "0.625rem", color: "#6b7280" }}>{color}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      {["error", "success", "warning", "info"].map((colorName) => (
        <div key={colorName} style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", textTransform: "capitalize" }}>{colorName} Colors</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {Object.entries(colors[colorName as keyof typeof colors] as Record<string, string>).map(([shade, color]) => (
              <div key={shade} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: color,
                    borderRadius: "6px",
                    marginBottom: "0.5rem",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <div style={{ fontSize: "0.75rem" }}>{shade}</div>
                <div style={{ fontSize: "0.625rem", color: "#6b7280" }}>{color}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Gray Scale */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Gray Scale</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.entries(colors.gray).map(([shade, color]) => (
            <div key={shade} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: color,
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              />
              <div style={{ fontSize: "0.75rem" }}>{shade}</div>
              <div style={{ fontSize: "0.625rem", color: "#6b7280" }}>{color}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Colors */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Background Colors</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "100%",
                height: "80px",
                backgroundColor: colors.background.primary,
                borderRadius: "8px",
                marginBottom: "0.5rem",
                border: "1px solid #e5e7eb",
              }}
            />
            <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>Primary</div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{colors.background.primary}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "100%",
                height: "80px",
                background: colors.background.gradient,
                borderRadius: "8px",
                marginBottom: "0.5rem",
                border: "1px solid #e5e7eb",
              }}
            />
            <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>Gradient</div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Linear Gradient</div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complete color palette including primary, semantic, and background colors.",
      },
    },
  },
};

// Typography
export const Typography: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Typography System</h2>
      
      {/* Font Sizes */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Font Sizes</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Object.entries(typography.fontSize).map(([name, size]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ width: "80px", fontSize: "0.875rem", color: "#6b7280" }}>
                {name}
              </div>
              <div style={{ width: "80px", fontSize: "0.875rem", color: "#6b7280" }}>
                {size}
              </div>
              <div style={{ fontSize: size, fontFamily: typography.fontFamily.sans.join(", ") }}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Font Weights</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Object.entries(typography.fontWeight).map(([name, weight]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ width: "100px", fontSize: "0.875rem", color: "#6b7280" }}>
                {name}
              </div>
              <div style={{ width: "60px", fontSize: "0.875rem", color: "#6b7280" }}>
                {weight}
              </div>
              <div style={{ 
                fontSize: typography.fontSize.lg, 
                fontWeight: weight,
                fontFamily: typography.fontFamily.sans.join(", ")
              }}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line Heights */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Line Heights</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Object.entries(typography.lineHeight).map(([name, height]) => (
            <div key={name} style={{ display: "flex", alignItems: "flex-start", gap: "2rem" }}>
              <div style={{ width: "80px", fontSize: "0.875rem", color: "#6b7280" }}>
                {name}
              </div>
              <div style={{ width: "60px", fontSize: "0.875rem", color: "#6b7280" }}>
                {height}
              </div>
              <div style={{ 
                fontSize: typography.fontSize.base,
                lineHeight: height,
                fontFamily: typography.fontFamily.sans.join(", "),
                maxWidth: "400px"
              }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Typography system including font sizes, weights, and line heights.",
      },
    },
  },
};

// Spacing
export const Spacing: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Spacing System</h2>
      <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
        8px-based spacing scale for consistent layouts
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Object.entries(spacing).slice(0, 20).map(([name, value]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ width: "60px", fontSize: "0.875rem", color: "#6b7280" }}>
              {name}
            </div>
            <div style={{ width: "80px", fontSize: "0.875rem", color: "#6b7280" }}>
              {value}
            </div>
            <div
              style={{
                width: value,
                height: "24px",
                backgroundColor: colors.primary[500],
                borderRadius: "4px",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "8px-based spacing scale used throughout the design system.",
      },
    },
  },
};

// Borders & Shadows
export const BordersAndShadows: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Borders & Shadows</h2>
      
      {/* Border Radius */}
      <div style={{ marginBottom: "3rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Border Radius</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
          {Object.entries(borders.radius).map(([name, value]) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: colors.primary[100],
                  border: `2px solid ${colors.primary[500]}`,
                  borderRadius: value,
                  margin: "0 auto 0.5rem",
                }}
              />
              <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>{name}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Shadows</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
          {Object.entries(shadows).filter(([name]) => !name.includes("focus")).map(([name, value]) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: colors.background.primary,
                  borderRadius: borders.radius.lg,
                  boxShadow: value,
                  margin: "0 auto 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>{name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Shadows */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Focus Shadows</h3>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {Object.entries(shadows.focus).map(([name, value]) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "120px",
                  height: "40px",
                  backgroundColor: colors.background.primary,
                  border: `2px solid ${colors.primary[500]}`,
                  borderRadius: borders.radius.md,
                  boxShadow: value,
                  margin: "0 auto 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                }}
              >
                Focus {name}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>{name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Border radius and shadow tokens for consistent elevation and focus states.",
      },
    },
  },
};

// Breakpoints
export const Breakpoints: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Responsive Breakpoints</h2>
      <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
        Mobile-first responsive design breakpoints
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Object.entries(breakpoints).map(([name, value]) => (
          <div key={name} style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "2rem",
            padding: "1rem",
            backgroundColor: colors.background.secondary,
            borderRadius: borders.radius.lg,
          }}>
            <div style={{ width: "60px", fontSize: "0.875rem", fontWeight: "500" }}>
              {name}
            </div>
            <div style={{ width: "100px", fontSize: "0.875rem", color: "#6b7280" }}>
              {value}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {name === "xs" && "Extra small devices (phones)"}
              {name === "sm" && "Small devices (large phones)"}
              {name === "md" && "Medium devices (tablets)"}
              {name === "lg" && "Large devices (laptops)"}
              {name === "xl" && "Extra large devices (desktops)"}
              {name === "2xl" && "2x extra large devices"}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Responsive breakpoints for consistent cross-device experiences.",
      },
    },
  },
};

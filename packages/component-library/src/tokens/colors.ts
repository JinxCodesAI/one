/**
 * Design Tokens - Colors
 * 
 * Unified color system that consolidates colors from both applications
 * and provides a comprehensive palette for all UI needs.
 */

export const colors = {
  // Primary brand colors (unified from audit findings)
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Unified primary blue (from Todo App)
    600: "#2563eb", // AI Chat primary
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Semantic colors (standardized across apps)
  error: {
    50: "#fef2f2",
    100: "#fecaca",
    200: "#fca5a5",
    300: "#f87171",
    400: "#f56565",
    500: "#ef4444", // Todo App error color
    600: "#dc2626", // AI Chat error color
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#10b981", // Unified success green
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // Unified warning orange
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  info: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  // Neutral scale (comprehensive grayscale)
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937", // AI Chat header color
    900: "#111827",
  },

  // Background variants
  background: {
    primary: "#ffffff",
    secondary: "#f9fafb",
    tertiary: "#f3f4f6",
    // Todo App gradient background
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    // Glassmorphism effect
    glass: "rgba(255, 255, 255, 0.1)",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Text colors
  text: {
    primary: "#111827",
    secondary: "#374151",
    tertiary: "#6b7280",
    quaternary: "#9ca3af",
    inverse: "#ffffff",
    disabled: "#d1d5db",
  },

  // Border colors
  border: {
    primary: "#e5e7eb",
    secondary: "#d1d5db",
    tertiary: "#9ca3af",
    focus: "#3b82f6",
    error: "#ef4444",
    success: "#10b981",
  },

  // Special purpose colors
  special: {
    // AI-generated content indicator
    aiGenerated: "#8b5cf6",
    // Priority indicators (from Todo App)
    priorityHigh: "#ef4444",
    priorityMedium: "#f59e0b",
    priorityLow: "#10b981",
    // Credits and transactions
    credits: "#d97706",
    positive: "#10b981",
    negative: "#ef4444",
  },
} as const;

// Color utility functions
export const colorUtils = {
  /**
   * Get color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },

  /**
   * Get semantic color by name and shade
   */
  semantic: (name: keyof typeof colors, shade: number = 500): string => {
    const colorGroup = colors[name];
    if (typeof colorGroup === "object" && shade in colorGroup) {
      return (colorGroup as any)[shade];
    }
    return colors.gray[500];
  },

  /**
   * Get priority color
   */
  priority: (priority: "high" | "medium" | "low"): string => {
    switch (priority) {
      case "high":
        return colors.special.priorityHigh;
      case "medium":
        return colors.special.priorityMedium;
      case "low":
        return colors.special.priorityLow;
      default:
        return colors.gray[500];
    }
  },
};

// Export individual color groups for convenience
export const {
  primary,
  error,
  success,
  warning,
  info,
  gray,
  background,
  text,
  border,
  special,
} = colors;

// Type definitions for TypeScript
export type ColorScale = typeof colors.primary;
export type ColorName = keyof typeof colors;
export type ColorShade = keyof ColorScale;
export type SemanticColor = "primary" | "error" | "success" | "warning" | "info";
export type Priority = "high" | "medium" | "low";

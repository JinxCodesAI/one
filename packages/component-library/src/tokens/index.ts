/**
 * Design Tokens - Main Export
 * 
 * Centralized export of all design tokens for easy import
 * and consistent usage across the component library.
 */

// Export all token modules
export * from "./colors.ts";
export * from "./typography.ts";
export * from "./spacing.ts";
export * from "./borders.ts";
export * from "./breakpoints.ts";

// Re-export commonly used tokens for convenience
export {
  colors,
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
  colorUtils,
} from "./colors.ts";

export {
  typography,
  semanticTypography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  typographyUtils,
} from "./typography.ts";

export {
  spacing,
  semanticSpacing,
  componentSpacing,
  layoutSpacing,
  formSpacing,
  containerSpacing,
  spacingUtils,
} from "./spacing.ts";

export {
  borders,
  shadows,
  radius,
  width,
  style,
  borderUtils,
} from "./borders.ts";

export {
  breakpoints,
  mediaQueries,
  containers,
  grid,
  responsiveUtils,
  responsivePatterns,
} from "./breakpoints.ts";

// Combined theme object for easy consumption
export const theme = {
  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      900: "#1e3a8a",
    },
    error: {
      50: "#fef2f2",
      500: "#ef4444",
      600: "#dc2626",
    },
    success: {
      50: "#f0fdf4",
      500: "#10b981",
      600: "#059669",
    },
    warning: {
      50: "#fffbeb",
      500: "#f59e0b",
      600: "#d97706",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    text: {
      primary: "#111827",
      secondary: "#374151",
      tertiary: "#6b7280",
      inverse: "#ffffff",
    },
    border: {
      primary: "#e5e7eb",
      focus: "#3b82f6",
      error: "#ef4444",
    },
  },
  typography: {
    fontFamily: {
      sans: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "sans-serif",
      ],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem",
    16: "4rem",
  },
  borders: {
    radius: {
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      full: "9999px",
    },
    width: {
      1: "1px",
      2: "2px",
    },
  },
  shadows: {
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    focus: {
      primary: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      error: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    },
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
} as const;

// Theme creation utilities
export interface ThemeOverrides {
  colors?: Partial<typeof theme.colors>;
  typography?: Partial<typeof theme.typography>;
  spacing?: Partial<typeof theme.spacing>;
  borders?: Partial<typeof theme.borders>;
  shadows?: Partial<typeof theme.shadows>;
  breakpoints?: Partial<typeof theme.breakpoints>;
}

/**
 * Create a custom theme by merging overrides with the default theme
 */
export function createTheme(overrides: ThemeOverrides = {}) {
  return {
    colors: { ...theme.colors, ...overrides.colors },
    typography: { ...theme.typography, ...overrides.typography },
    spacing: { ...theme.spacing, ...overrides.spacing },
    borders: { ...theme.borders, ...overrides.borders },
    shadows: { ...theme.shadows, ...overrides.shadows },
    breakpoints: { ...theme.breakpoints, ...overrides.breakpoints },
  };
}

// Type definitions for theme
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeBorders = typeof theme.borders;
export type ThemeShadows = typeof theme.shadows;
export type ThemeBreakpoints = typeof theme.breakpoints;

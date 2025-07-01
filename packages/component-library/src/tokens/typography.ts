/**
 * Design Tokens - Typography
 * 
 * Unified typography system that provides consistent font scales,
 * weights, and line heights across all applications.
 */

export const typography = {
  // Font families (unified system font stack from both apps)
  fontFamily: {
    sans: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "sans-serif",
    ],
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "monospace",
    ],
  },

  // Font sizes (comprehensive scale)
  fontSize: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px - Used in both apps
    base: "1rem",      // 16px - Base size
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px - AI Chat header
    "3xl": "1.875rem", // 30px - Todo App content header
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    "6xl": "3.75rem",  // 60px
  },

  // Font weights
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",     // Used in both apps
    semibold: "600",   // AI Chat header, Todo App titles
    bold: "700",       // Todo App strong emphasis
    extrabold: "800",
    black: "900",
  },

  // Line heights
  lineHeight: {
    none: "1",
    tight: "1.25",     // For headings
    snug: "1.375",
    normal: "1.5",     // Default line height
    relaxed: "1.625",
    loose: "2",
  },

  // Letter spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Text decoration
  textDecoration: {
    none: "none",
    underline: "underline",
    lineThrough: "line-through",
  },

  // Text transform
  textTransform: {
    none: "none",
    uppercase: "uppercase",
    lowercase: "lowercase",
    capitalize: "capitalize",
  },
} as const;

// Semantic typography scales for consistent usage
export const semanticTypography = {
  // Heading scales
  heading: {
    h1: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    },
    h2: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight,
    },
    h3: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h4: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.snug,
    },
    h5: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    h6: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
  },

  // Body text scales
  body: {
    large: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.relaxed,
    },
    base: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
    small: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
    xs: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
  },

  // UI element typography
  ui: {
    button: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.none,
    },
    input: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
    code: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      fontFamily: typography.fontFamily.mono,
    },
  },
} as const;

// Typography utility functions
export const typographyUtils = {
  /**
   * Get font family as CSS string
   */
  getFontFamily: (family: keyof typeof typography.fontFamily): string => {
    return typography.fontFamily[family].join(", ");
  },

  /**
   * Get semantic typography styles
   */
  getSemanticStyles: (
    category: keyof typeof semanticTypography,
    variant: string
  ): Record<string, string> => {
    const categoryStyles = semanticTypography[category] as any;
    if (categoryStyles && categoryStyles[variant]) {
      const styles = categoryStyles[variant];
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        fontFamily: styles.fontFamily || typographyUtils.getFontFamily("sans"),
      };
    }
    return {};
  },

  /**
   * Create responsive font size
   */
  responsive: (
    mobile: keyof typeof typography.fontSize,
    desktop: keyof typeof typography.fontSize
  ) => ({
    fontSize: typography.fontSize[mobile],
    "@media (min-width: 768px)": {
      fontSize: typography.fontSize[desktop],
    },
  }),
};

// Export individual typography groups for convenience
export const {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textDecoration,
  textTransform,
} = typography;

// Type definitions
export type FontFamily = keyof typeof typography.fontFamily;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
export type LetterSpacing = keyof typeof typography.letterSpacing;
export type HeadingLevel = keyof typeof semanticTypography.heading;
export type BodyVariant = keyof typeof semanticTypography.body;
export type UIVariant = keyof typeof semanticTypography.ui;

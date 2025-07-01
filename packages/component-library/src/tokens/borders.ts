/**
 * Design Tokens - Borders
 * 
 * Border radius, width, and style tokens for consistent
 * border styling across all components.
 */

export const borders = {
  // Border radius scale
  radius: {
    none: "0",
    xs: "0.125rem",    // 2px
    sm: "0.25rem",     // 4px
    md: "0.375rem",    // 6px - AI Chat buttons
    lg: "0.5rem",      // 8px - Todo App inputs/buttons
    xl: "0.75rem",     // 12px - Todo App cards
    "2xl": "1rem",     // 16px - Todo App main content
    "3xl": "1.5rem",   // 24px
    full: "9999px",    // Fully rounded (pills, avatars)
  },

  // Border widths
  width: {
    0: "0",
    1: "1px",          // Default border
    2: "2px",          // Focus states, Todo App inputs
    4: "4px",          // Emphasis borders
    8: "8px",          // Heavy emphasis
  },

  // Border styles
  style: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
    double: "double",
    none: "none",
  },
} as const;

// Semantic border configurations
export const semanticBorders = {
  // Input field borders
  input: {
    default: {
      width: borders.width[2],
      style: borders.style.solid,
      radius: borders.radius.lg,
    },
    focus: {
      width: borders.width[2],
      style: borders.style.solid,
      radius: borders.radius.lg,
    },
    error: {
      width: borders.width[2],
      style: borders.style.solid,
      radius: borders.radius.lg,
    },
  },

  // Button borders
  button: {
    default: {
      width: borders.width[1],
      style: borders.style.solid,
      radius: borders.radius.lg,
    },
    outline: {
      width: borders.width[2],
      style: borders.style.solid,
      radius: borders.radius.lg,
    },
    pill: {
      width: borders.width[1],
      style: borders.style.solid,
      radius: borders.radius.full,
    },
  },

  // Card borders
  card: {
    default: {
      width: borders.width[1],
      style: borders.style.solid,
      radius: borders.radius.xl,
    },
    elevated: {
      width: borders.width[0],
      style: borders.style.none,
      radius: borders.radius["2xl"],
    },
  },

  // Modal borders
  modal: {
    default: {
      width: borders.width[0],
      style: borders.style.none,
      radius: borders.radius.xl,
    },
  },

  // Avatar borders
  avatar: {
    default: {
      width: borders.width[2],
      style: borders.style.solid,
      radius: borders.radius.full,
    },
    square: {
      width: borders.width[2],
      style: borders.style.solid,
      radius: borders.radius.lg,
    },
  },

  // Badge borders
  badge: {
    default: {
      width: borders.width[0],
      style: borders.style.none,
      radius: borders.radius.md,
    },
    outlined: {
      width: borders.width[1],
      style: borders.style.solid,
      radius: borders.radius.md,
    },
    pill: {
      width: borders.width[0],
      style: borders.style.none,
      radius: borders.radius.full,
    },
  },

  // Divider borders
  divider: {
    horizontal: {
      width: borders.width[1],
      style: borders.style.solid,
      radius: borders.radius.none,
    },
    vertical: {
      width: borders.width[1],
      style: borders.style.solid,
      radius: borders.radius.none,
    },
  },
} as const;

// Shadow system (related to borders for elevation)
export const shadows = {
  // Shadow scale
  none: "none",
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)", // Todo App modal shadow
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  
  // Focus shadows
  focus: {
    primary: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    error: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    success: "0 0 0 3px rgba(16, 185, 129, 0.1)",
  },
} as const;

// Border utility functions
export const borderUtils = {
  /**
   * Get border configuration
   */
  get: (
    category: keyof typeof semanticBorders,
    variant: string
  ): Record<string, string> => {
    const categoryBorders = semanticBorders[category] as any;
    if (categoryBorders && categoryBorders[variant]) {
      const config = categoryBorders[variant];
      return {
        borderWidth: config.width,
        borderStyle: config.style,
        borderRadius: config.radius,
      };
    }
    return {};
  },

  /**
   * Create border shorthand
   */
  create: (
    width: keyof typeof borders.width,
    style: keyof typeof borders.style,
    color: string
  ): string => {
    return `${borders.width[width]} ${borders.style[style]} ${color}`;
  },

  /**
   * Create focus ring
   */
  focusRing: (color: "primary" | "error" | "success" = "primary"): Record<string, string> => {
    return {
      outline: "none",
      boxShadow: shadows.focus[color],
    };
  },

  /**
   * Create elevation with shadow
   */
  elevation: (level: keyof typeof shadows): Record<string, string> => {
    return {
      boxShadow: shadows[level],
    };
  },

  /**
   * Create rounded corners
   */
  rounded: (size: keyof typeof borders.radius): Record<string, string> => {
    return {
      borderRadius: borders.radius[size],
    };
  },

  /**
   * Create border on specific sides
   */
  sides: {
    top: (width: keyof typeof borders.width, style: keyof typeof borders.style, color: string) => ({
      borderTop: borderUtils.create(width, style, color),
    }),
    right: (width: keyof typeof borders.width, style: keyof typeof borders.style, color: string) => ({
      borderRight: borderUtils.create(width, style, color),
    }),
    bottom: (width: keyof typeof borders.width, style: keyof typeof borders.style, color: string) => ({
      borderBottom: borderUtils.create(width, style, color),
    }),
    left: (width: keyof typeof borders.width, style: keyof typeof borders.style, color: string) => ({
      borderLeft: borderUtils.create(width, style, color),
    }),
  },
};

// Export individual border groups for convenience
export const {
  radius,
  width,
  style,
} = borders;

export const {
  input: inputBorders,
  button: buttonBorders,
  card: cardBorders,
  modal: modalBorders,
  avatar: avatarBorders,
  badge: badgeBorders,
  divider: dividerBorders,
} = semanticBorders;

// Type definitions
export type BorderRadius = keyof typeof borders.radius;
export type BorderWidth = keyof typeof borders.width;
export type BorderStyle = keyof typeof borders.style;
export type ShadowSize = keyof typeof shadows;
export type FocusColor = keyof typeof shadows.focus;
export type BorderCategory = keyof typeof semanticBorders;

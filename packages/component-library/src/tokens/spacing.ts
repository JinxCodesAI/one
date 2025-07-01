/**
 * Design Tokens - Spacing
 * 
 * 8px-based spacing system that provides consistent spacing
 * across all components and layouts.
 */

export const spacing = {
  // Base spacing scale (8px grid)
  0: "0",
  px: "1px",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px - Base unit
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  9: "2.25rem",     // 36px
  10: "2.5rem",     // 40px
  11: "2.75rem",    // 44px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  28: "7rem",       // 112px
  32: "8rem",       // 128px
  36: "9rem",       // 144px
  40: "10rem",      // 160px
  44: "11rem",      // 176px
  48: "12rem",      // 192px
  52: "13rem",      // 208px
  56: "14rem",      // 224px
  60: "15rem",      // 240px
  64: "16rem",      // 256px
  72: "18rem",      // 288px
  80: "20rem",      // 320px
  96: "24rem",      // 384px
} as const;

// Semantic spacing for specific use cases
export const semanticSpacing = {
  // Component internal spacing
  component: {
    xs: spacing[1],      // 4px - Tight spacing
    sm: spacing[2],      // 8px - Small spacing
    md: spacing[4],      // 16px - Medium spacing
    lg: spacing[6],      // 24px - Large spacing
    xl: spacing[8],      // 32px - Extra large spacing
  },

  // Layout spacing
  layout: {
    xs: spacing[4],      // 16px - Minimal layout spacing
    sm: spacing[6],      // 24px - Small layout spacing
    md: spacing[8],      // 32px - Medium layout spacing
    lg: spacing[12],     // 48px - Large layout spacing
    xl: spacing[16],     // 64px - Extra large layout spacing
    "2xl": spacing[20],  // 80px - 2x extra large
    "3xl": spacing[24],  // 96px - 3x extra large
  },

  // Form element spacing
  form: {
    fieldGap: spacing[4],        // 16px - Between form fields
    labelGap: spacing[2],        // 8px - Between label and input
    buttonGap: spacing[3],       // 12px - Between buttons
    sectionGap: spacing[6],      // 24px - Between form sections
  },

  // Card and container spacing
  container: {
    padding: {
      xs: spacing[3],    // 12px
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
    },
    gap: {
      xs: spacing[2],    // 8px
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
    },
  },

  // Navigation spacing
  navigation: {
    itemGap: spacing[1],         // 4px - Between nav items
    sectionGap: spacing[4],      // 16px - Between nav sections
    padding: spacing[3],         // 12px - Nav item padding
  },

  // Modal and overlay spacing
  modal: {
    padding: spacing[6],         // 24px - Modal content padding
    gap: spacing[4],            // 16px - Between modal elements
    margin: spacing[4],         // 16px - Modal margin from viewport
  },
} as const;

// Responsive spacing utilities
export const responsiveSpacing = {
  // Mobile-first responsive spacing
  responsive: {
    xs: {
      mobile: spacing[2],    // 8px on mobile
      tablet: spacing[3],    // 12px on tablet
      desktop: spacing[4],   // 16px on desktop
    },
    sm: {
      mobile: spacing[3],    // 12px on mobile
      tablet: spacing[4],    // 16px on tablet
      desktop: spacing[6],   // 24px on desktop
    },
    md: {
      mobile: spacing[4],    // 16px on mobile
      tablet: spacing[6],    // 24px on tablet
      desktop: spacing[8],   // 32px on desktop
    },
    lg: {
      mobile: spacing[6],    // 24px on mobile
      tablet: spacing[8],    // 32px on tablet
      desktop: spacing[12],  // 48px on desktop
    },
    xl: {
      mobile: spacing[8],    // 32px on mobile
      tablet: spacing[12],   // 48px on tablet
      desktop: spacing[16],  // 64px on desktop
    },
  },
} as const;

// Spacing utility functions
export const spacingUtils = {
  /**
   * Get spacing value by key
   */
  get: (key: keyof typeof spacing): string => {
    return spacing[key];
  },

  /**
   * Get semantic spacing
   */
  semantic: (
    category: keyof typeof semanticSpacing,
    variant: string
  ): string => {
    const categorySpacing = semanticSpacing[category] as any;
    if (categorySpacing && categorySpacing[variant]) {
      return categorySpacing[variant];
    }
    return spacing[4]; // Default to 16px
  },

  /**
   * Create responsive spacing
   */
  responsive: (
    mobile: keyof typeof spacing,
    tablet?: keyof typeof spacing,
    desktop?: keyof typeof spacing
  ) => ({
    padding: spacing[mobile],
    "@media (min-width: 768px)": tablet ? { padding: spacing[tablet] } : {},
    "@media (min-width: 1024px)": desktop ? { padding: spacing[desktop] } : {},
  }),

  /**
   * Create margin utilities
   */
  margin: {
    top: (value: keyof typeof spacing) => ({ marginTop: spacing[value] }),
    right: (value: keyof typeof spacing) => ({ marginRight: spacing[value] }),
    bottom: (value: keyof typeof spacing) => ({ marginBottom: spacing[value] }),
    left: (value: keyof typeof spacing) => ({ marginLeft: spacing[value] }),
    x: (value: keyof typeof spacing) => ({
      marginLeft: spacing[value],
      marginRight: spacing[value],
    }),
    y: (value: keyof typeof spacing) => ({
      marginTop: spacing[value],
      marginBottom: spacing[value],
    }),
    all: (value: keyof typeof spacing) => ({ margin: spacing[value] }),
  },

  /**
   * Create padding utilities
   */
  padding: {
    top: (value: keyof typeof spacing) => ({ paddingTop: spacing[value] }),
    right: (value: keyof typeof spacing) => ({ paddingRight: spacing[value] }),
    bottom: (value: keyof typeof spacing) => ({ paddingBottom: spacing[value] }),
    left: (value: keyof typeof spacing) => ({ paddingLeft: spacing[value] }),
    x: (value: keyof typeof spacing) => ({
      paddingLeft: spacing[value],
      paddingRight: spacing[value],
    }),
    y: (value: keyof typeof spacing) => ({
      paddingTop: spacing[value],
      paddingBottom: spacing[value],
    }),
    all: (value: keyof typeof spacing) => ({ padding: spacing[value] }),
  },

  /**
   * Create gap utilities
   */
  gap: (value: keyof typeof spacing) => ({ gap: spacing[value] }),
};

// Export individual spacing groups for convenience
export const {
  component: componentSpacing,
  layout: layoutSpacing,
  form: formSpacing,
  container: containerSpacing,
  navigation: navigationSpacing,
  modal: modalSpacing,
} = semanticSpacing;

// Type definitions
export type SpacingKey = keyof typeof spacing;
export type ComponentSpacing = keyof typeof semanticSpacing.component;
export type LayoutSpacing = keyof typeof semanticSpacing.layout;
export type ResponsiveSpacingSize = keyof typeof responsiveSpacing.responsive;

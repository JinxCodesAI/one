/**
 * Design Tokens - Breakpoints
 * 
 * Responsive design breakpoints for consistent
 * responsive behavior across all components.
 */

export const breakpoints = {
  // Breakpoint values
  xs: "0px",        // Extra small devices
  sm: "480px",      // Small devices (phones)
  md: "768px",      // Medium devices (tablets) - Used in both apps
  lg: "1024px",     // Large devices (laptops) - Todo App breakpoint
  xl: "1280px",     // Extra large devices (desktops)
  "2xl": "1536px",  // 2x extra large devices
} as const;

// Media query utilities
export const mediaQueries = {
  // Min-width media queries (mobile-first)
  up: {
    xs: `@media (min-width: ${breakpoints.xs})`,
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`,
    "2xl": `@media (min-width: ${breakpoints["2xl"]})`,
  },

  // Max-width media queries (desktop-first)
  down: {
    xs: `@media (max-width: ${breakpoints.sm})`,
    sm: `@media (max-width: ${breakpoints.md})`,
    md: `@media (max-width: ${breakpoints.lg})`,
    lg: `@media (max-width: ${breakpoints.xl})`,
    xl: `@media (max-width: ${breakpoints["2xl"]})`,
  },

  // Between breakpoints
  between: {
    smMd: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
    mdLg: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
    lgXl: `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
  },

  // Specific device targeting
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  
  // Orientation queries
  landscape: "@media (orientation: landscape)",
  portrait: "@media (orientation: portrait)",
  
  // High DPI displays
  retina: "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
} as const;

// Container max-widths for different breakpoints
export const containers = {
  xs: "100%",
  sm: "100%",
  md: "768px",
  lg: "1024px",
  xl: "1200px",     // Todo App container max-width
  "2xl": "1400px",
} as const;

// Grid system based on breakpoints
export const grid = {
  // Column counts for different breakpoints
  columns: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
    "2xl": 8,
  },

  // Gutter sizes for different breakpoints
  gutters: {
    xs: "1rem",      // 16px
    sm: "1.5rem",    // 24px
    md: "2rem",      // 32px - Todo App grid gap
    lg: "2.5rem",    // 40px
    xl: "3rem",      // 48px
    "2xl": "4rem",   // 64px
  },
} as const;

// Responsive utility functions
export const responsiveUtils = {
  /**
   * Create responsive styles object
   */
  responsive: <T>(styles: Partial<Record<keyof typeof breakpoints, T>>): Record<string, T> => {
    const result: Record<string, T> = {};
    
    Object.entries(styles).forEach(([breakpoint, style]) => {
      if (breakpoint === "xs") {
        Object.assign(result, style);
      } else {
        const mediaQuery = mediaQueries.up[breakpoint as keyof typeof mediaQueries.up];
        result[mediaQuery] = style;
      }
    });
    
    return result;
  },

  /**
   * Create mobile-first responsive value
   */
  mobileFirst: <T>(
    mobile: T,
    tablet?: T,
    desktop?: T,
    wide?: T
  ): Record<string, T> => {
    const result: Record<string, T> = { default: mobile };
    
    if (tablet) result[mediaQueries.up.md] = tablet;
    if (desktop) result[mediaQueries.up.lg] = desktop;
    if (wide) result[mediaQueries.up.xl] = wide;
    
    return result;
  },

  /**
   * Create desktop-first responsive value
   */
  desktopFirst: <T>(
    desktop: T,
    tablet?: T,
    mobile?: T
  ): Record<string, T> => {
    const result: Record<string, T> = { default: desktop };
    
    if (tablet) result[mediaQueries.down.lg] = tablet;
    if (mobile) result[mediaQueries.down.md] = mobile;
    
    return result;
  },

  /**
   * Get container max-width for breakpoint
   */
  getContainer: (breakpoint: keyof typeof containers): string => {
    return containers[breakpoint];
  },

  /**
   * Create responsive grid
   */
  createGrid: (
    columns: Partial<Record<keyof typeof breakpoints, number>>,
    gap?: Partial<Record<keyof typeof breakpoints, string>>
  ) => {
    const gridStyles: Record<string, any> = {
      display: "grid",
      gap: gap?.xs || grid.gutters.xs,
      gridTemplateColumns: `repeat(${columns.xs || 1}, 1fr)`,
    };

    Object.entries(columns).forEach(([breakpoint, cols]) => {
      if (breakpoint !== "xs") {
        const mediaQuery = mediaQueries.up[breakpoint as keyof typeof mediaQueries.up];
        gridStyles[mediaQuery] = {
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: gap?.[breakpoint as keyof typeof breakpoints] || grid.gutters[breakpoint as keyof typeof grid.gutters],
        };
      }
    });

    return gridStyles;
  },

  /**
   * Hide/show at specific breakpoints
   */
  visibility: {
    hideBelow: (breakpoint: keyof typeof breakpoints) => ({
      display: "none",
      [mediaQueries.up[breakpoint]]: {
        display: "block",
      },
    }),
    hideAbove: (breakpoint: keyof typeof breakpoints) => ({
      display: "block",
      [mediaQueries.up[breakpoint]]: {
        display: "none",
      },
    }),
    showOnly: (breakpoint: keyof typeof breakpoints) => {
      const prevBreakpoint = Object.keys(breakpoints)[
        Object.keys(breakpoints).indexOf(breakpoint) - 1
      ] as keyof typeof breakpoints;
      const nextBreakpoint = Object.keys(breakpoints)[
        Object.keys(breakpoints).indexOf(breakpoint) + 1
      ] as keyof typeof breakpoints;

      return {
        display: "none",
        [mediaQueries.up[breakpoint]]: {
          display: "block",
        },
        ...(nextBreakpoint && {
          [mediaQueries.up[nextBreakpoint]]: {
            display: "none",
          },
        }),
      };
    },
  },
};

// Common responsive patterns from the applications
export const responsivePatterns = {
  // Todo App grid pattern
  todoAppGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1rem",
    padding: "1rem 0",
    [mediaQueries.up.md]: {
      gridTemplateColumns: "320px 1fr",
      gap: "2rem",
      padding: "2rem 0",
    },
    [mediaQueries.up.lg]: {
      gridTemplateColumns: "320px 1fr",
      gap: "2rem",
    },
  },

  // AI Chat responsive layout
  aiChatLayout: {
    height: "100vh",
    [mediaQueries.down.md]: {
      height: "100dvh", // Dynamic viewport height for mobile
    },
  },

  // Modal responsive behavior
  modalResponsive: {
    maxWidth: "500px",
    width: "100%",
    margin: "1rem",
    [mediaQueries.down.sm]: {
      margin: "0.5rem",
      maxHeight: "90vh",
    },
  },

  // Button responsive sizing
  buttonResponsive: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    [mediaQueries.down.md]: {
      padding: "0.75rem 1rem",
      fontSize: "1rem",
    },
  },
};

// Export individual groups for convenience
export const { up, down, between, mobile, tablet, desktop } = mediaQueries;

// Type definitions
export type Breakpoint = keyof typeof breakpoints;
export type MediaQuery = keyof typeof mediaQueries.up;
export type ContainerSize = keyof typeof containers;
export type GridColumns = keyof typeof grid.columns;

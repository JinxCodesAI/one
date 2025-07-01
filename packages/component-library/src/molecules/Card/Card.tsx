/**
 * Card Molecule Component
 * 
 * Versatile card container component that provides consistent
 * styling for content grouping with various visual variants.
 */

import React from "react";
import { colors, spacing, borders, shadows } from "../../tokens/index.ts";

export interface CardProps {
  /** Card variant */
  variant?: "default" | "elevated" | "outlined" | "glass";
  /** Card padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Whether card is interactive (hover effects) */
  interactive?: boolean;
  /** Card content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

export function Card({
  variant = "default",
  padding = "md",
  interactive = false,
  children,
  className = "",
  style = {},
  onClick,
}: CardProps): React.ReactElement {
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: "block",
    borderRadius: borders.radius.xl,
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    cursor: interactive || onClick ? "pointer" : "default",
  };

  // Padding styles
  const paddingStyles: Record<string, React.CSSProperties> = {
    none: {
      padding: "0",
    },
    sm: {
      padding: spacing[3],
    },
    md: {
      padding: spacing[4],
    },
    lg: {
      padding: spacing[6],
    },
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: colors.background.primary,
      border: `1px solid ${colors.border.primary}`,
      boxShadow: shadows.sm,
    },
    elevated: {
      backgroundColor: colors.background.primary,
      border: "none",
      boxShadow: shadows.md,
    },
    outlined: {
      backgroundColor: colors.background.primary,
      border: `2px solid ${colors.border.primary}`,
      boxShadow: "none",
    },
    glass: {
      backgroundColor: colors.background.glass,
      backdropFilter: "blur(10px)",
      border: `1px solid ${colors.background.glass}`,
      boxShadow: shadows.sm,
    },
  };

  // Interactive hover styles
  const getHoverStyles = (): React.CSSProperties => {
    if (!interactive && !onClick) return {};

    switch (variant) {
      case "default":
        return {
          boxShadow: shadows.md,
          transform: "translateY(-1px)",
        };
      case "elevated":
        return {
          boxShadow: shadows.lg,
          transform: "translateY(-2px)",
        };
      case "outlined":
        return {
          borderColor: colors.border.secondary,
          boxShadow: shadows.sm,
        };
      case "glass":
        return {
          backgroundColor: `${colors.background.glass}80`, // More opaque
          boxShadow: shadows.md,
        };
      default:
        return {};
    }
  };

  // State management for hover
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (interactive || onClick) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    onClick?.();
  };

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...(isHovered ? getHoverStyles() : {}),
    ...style,
  };

  // Determine the element type
  const Element = onClick ? "button" : "div";
  const elementProps = onClick ? {
    type: "button" as const,
    onClick: handleClick,
  } : {};

  return (
    <Element
      className={`card card-${variant} ${interactive ? "card-interactive" : ""} ${className}`}
      style={combinedStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...elementProps}
    >
      {children}
    </Element>
  );
}

/**
 * Badge Atom Component
 * 
 * Versatile badge component for status indicators, categories,
 * and priority labels based on patterns from both applications.
 */

import React from "react";
import { colors, spacing, typography, borders } from "../../tokens/index.ts";

export interface BadgeProps {
  /** Badge variant */
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
  /** Badge size */
  size?: "sm" | "md" | "lg";
  /** Badge style */
  style?: "filled" | "outline" | "soft";
  /** Priority-specific styling */
  priority?: "high" | "medium" | "low";
  /** Custom color override */
  color?: string;
  /** Badge content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  customStyle?: React.CSSProperties;
}

export function Badge({
  variant = "default",
  size = "md",
  style: badgeStyle = "filled",
  priority,
  color,
  children,
  className = "",
  customStyle = {},
}: BadgeProps): React.ReactElement {
  // Priority takes precedence over variant
  const effectiveVariant = priority ? 
    (priority === "high" ? "error" : priority === "medium" ? "warning" : "success") 
    : variant;

  // Base styles
  const baseStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: typography.fontFamily.sans.join(", "),
    fontWeight: typography.fontWeight.medium,
    borderRadius: borders.radius.md,
    border: "none",
    textAlign: "center",
    whiteSpace: "nowrap",
    verticalAlign: "baseline",
    textTransform: "none",
    lineHeight: "1",
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: `${spacing[0.5]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      minHeight: "1.25rem",
    },
    md: {
      padding: `${spacing[1]} ${spacing[2.5]}`,
      fontSize: typography.fontSize.xs,
      minHeight: "1.5rem",
    },
    lg: {
      padding: `${spacing[1.5]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      minHeight: "1.75rem",
    },
  };

  // Color configurations for each variant
  const colorConfigs = {
    default: {
      filled: {
        backgroundColor: colors.gray[100],
        color: colors.gray[800],
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.gray[700],
        border: `1px solid ${colors.gray[300]}`,
      },
      soft: {
        backgroundColor: colors.gray[50],
        color: colors.gray[700],
      },
    },
    primary: {
      filled: {
        backgroundColor: colors.primary[500],
        color: colors.text.inverse,
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.primary[600],
        border: `1px solid ${colors.primary[300]}`,
      },
      soft: {
        backgroundColor: colors.primary[50],
        color: colors.primary[700],
      },
    },
    secondary: {
      filled: {
        backgroundColor: colors.gray[500],
        color: colors.text.inverse,
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.gray[600],
        border: `1px solid ${colors.gray[300]}`,
      },
      soft: {
        backgroundColor: colors.gray[100],
        color: colors.gray[700],
      },
    },
    success: {
      filled: {
        backgroundColor: colors.success[500],
        color: colors.text.inverse,
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.success[600],
        border: `1px solid ${colors.success[300]}`,
      },
      soft: {
        backgroundColor: colors.success[50],
        color: colors.success[700],
      },
    },
    warning: {
      filled: {
        backgroundColor: colors.warning[500],
        color: colors.text.inverse,
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.warning[600],
        border: `1px solid ${colors.warning[300]}`,
      },
      soft: {
        backgroundColor: colors.warning[50],
        color: colors.warning[700],
      },
    },
    error: {
      filled: {
        backgroundColor: colors.error[500],
        color: colors.text.inverse,
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.error[600],
        border: `1px solid ${colors.error[300]}`,
      },
      soft: {
        backgroundColor: colors.error[50],
        color: colors.error[700],
      },
    },
    info: {
      filled: {
        backgroundColor: colors.info[500],
        color: colors.text.inverse,
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.info[600],
        border: `1px solid ${colors.info[300]}`,
      },
      soft: {
        backgroundColor: colors.info[50],
        color: colors.info[700],
      },
    },
  };

  // Get variant styles
  const variantStyles = colorConfigs[effectiveVariant][badgeStyle];

  // Apply custom color if provided
  const finalStyles = color ? {
    ...variantStyles,
    backgroundColor: badgeStyle === "filled" ? color : 
                    badgeStyle === "soft" ? `${color}20` : "transparent",
    color: badgeStyle === "filled" ? colors.text.inverse :
           badgeStyle === "outline" ? color : color,
    borderColor: badgeStyle === "outline" ? color : undefined,
  } : variantStyles;

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...finalStyles,
    ...customStyle,
  };

  return (
    <span
      className={`badge badge-${effectiveVariant} badge-${badgeStyle} badge-${size} ${className}`}
      style={combinedStyles}
    >
      {children}
    </span>
  );
}

/**
 * Button Atom Component
 * 
 * Unified button component that consolidates patterns from both applications
 * with comprehensive variants, sizes, and states.
 */

import React, { forwardRef } from "react";
import { colors, spacing, typography, borders, shadows } from "../../tokens/index.ts";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: "left" | "right";
  /** Full width button */
  fullWidth?: boolean;
  /** Button children */
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      disabled = false,
      children,
      className = "",
      style = {},
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base styles
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing[2],
      fontFamily: typography.fontFamily.sans.join(", "),
      fontWeight: typography.fontWeight.medium,
      borderRadius: borders.radius.lg,
      border: "none",
      cursor: isDisabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      textDecoration: "none",
      outline: "none",
      position: "relative",
      overflow: "hidden",
      width: fullWidth ? "100%" : "auto",
      opacity: isDisabled ? 0.6 : 1,
    };

    // Size styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: typography.fontSize.xs,
        minHeight: "2rem",
      },
      md: {
        padding: `${spacing[2.5]} ${spacing[4]}`,
        fontSize: typography.fontSize.sm,
        minHeight: "2.5rem",
      },
      lg: {
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
        minHeight: "3rem",
      },
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.primary[500],
        color: colors.text.inverse,
        boxShadow: shadows.sm,
      },
      secondary: {
        backgroundColor: colors.gray[500],
        color: colors.text.inverse,
        boxShadow: shadows.sm,
      },
      outline: {
        backgroundColor: "transparent",
        color: colors.text.primary,
        border: `${borders.width[2]} solid ${colors.border.primary}`,
      },
      ghost: {
        backgroundColor: "transparent",
        color: colors.text.primary,
      },
      danger: {
        backgroundColor: colors.error[500],
        color: colors.text.inverse,
        boxShadow: shadows.sm,
      },
    };

    // Hover styles (applied via onMouseEnter/onMouseLeave)
    const hoverStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.primary[600],
        boxShadow: shadows.md,
      },
      secondary: {
        backgroundColor: colors.gray[600],
        boxShadow: shadows.md,
      },
      outline: {
        backgroundColor: colors.gray[50],
        borderColor: colors.border.secondary,
      },
      ghost: {
        backgroundColor: colors.gray[50],
      },
      danger: {
        backgroundColor: colors.error[600],
        boxShadow: shadows.md,
      },
    };

    // Focus styles
    const focusStyles: React.CSSProperties = {
      boxShadow: variant === "danger" 
        ? shadows.focus.error 
        : shadows.focus.primary,
    };

    // Combine all styles
    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    // Handle mouse events for hover effects
    const [isHovered, setIsHovered] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleMouseEnter = () => {
      if (!isDisabled) setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    // Apply hover and focus styles
    if (isHovered && !isDisabled) {
      Object.assign(combinedStyles, hoverStyles[variant]);
    }

    if (isFocused) {
      Object.assign(combinedStyles, focusStyles);
    }

    // Loading spinner component
    const LoadingSpinner = () => (
      <div
        style={{
          width: "1rem",
          height: "1rem",
          border: "2px solid transparent",
          borderTop: `2px solid ${variant === "outline" || variant === "ghost" 
            ? colors.primary[500] 
            : "currentColor"}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    );

    // Render icon
    const renderIcon = () => {
      if (loading) return <LoadingSpinner />;
      if (!icon) return null;
      
      return (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: size === "sm" ? "0.875rem" : "1rem",
          }}
        >
          {icon}
        </span>
      );
    };

    return (
      <>
        <button
          ref={ref}
          className={className}
          style={combinedStyles}
          disabled={isDisabled}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        >
          {iconPosition === "left" && renderIcon()}
          {loading ? "Loading..." : children}
          {iconPosition === "right" && renderIcon()}
        </button>

        {/* CSS animation for loading spinner */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </>
    );
  }
);

Button.displayName = "Button";

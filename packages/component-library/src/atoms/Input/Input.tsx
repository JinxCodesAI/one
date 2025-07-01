/**
 * Input Atom Component
 * 
 * Unified input component that consolidates patterns from both applications
 * with validation states, error handling, and consistent styling.
 */

import React, { forwardRef } from "react";
import { colors, spacing, typography, borders, shadows } from "../../tokens/index.ts";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Input size */
  size?: "sm" | "md" | "lg";
  /** Error message to display */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Full width input */
  fullWidth?: boolean;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      error,
      success = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled = false,
      className = "",
      style = {},
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon);

    // Base styles
    const baseStyles: React.CSSProperties = {
      fontFamily: typography.fontFamily.sans.join(", "),
      fontWeight: typography.fontWeight.normal,
      borderRadius: borders.radius.lg,
      border: `${borders.width[2]} solid`,
      outline: "none",
      transition: "all 0.2s ease",
      width: fullWidth ? "100%" : "auto",
      backgroundColor: disabled ? colors.gray[50] : colors.background.primary,
      color: disabled ? colors.text.tertiary : colors.text.primary,
      cursor: disabled ? "not-allowed" : "text",
    };

    // Size styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: hasLeftIcon || hasRightIcon 
          ? `${spacing[2]} ${spacing[10]} ${spacing[2]} ${hasLeftIcon ? spacing[10] : spacing[3]}`
          : `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
        minHeight: "2rem",
      },
      md: {
        padding: hasLeftIcon || hasRightIcon 
          ? `${spacing[3]} ${spacing[12]} ${spacing[3]} ${hasLeftIcon ? spacing[12] : spacing[4]}`
          : `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
        minHeight: "2.5rem",
      },
      lg: {
        padding: hasLeftIcon || hasRightIcon 
          ? `${spacing[4]} ${spacing[14]} ${spacing[4]} ${hasLeftIcon ? spacing[14] : spacing[5]}`
          : `${spacing[4]} ${spacing[5]}`,
        fontSize: typography.fontSize.lg,
        minHeight: "3rem",
      },
    };

    // State styles
    const getStateStyles = (): React.CSSProperties => {
      if (hasError) {
        return {
          borderColor: colors.error[500],
        };
      }
      if (success) {
        return {
          borderColor: colors.success[500],
        };
      }
      return {
        borderColor: colors.border.primary,
      };
    };

    // Focus styles
    const getFocusStyles = (): React.CSSProperties => {
      if (hasError) {
        return {
          borderColor: colors.error[500],
          boxShadow: shadows.focus.error,
        };
      }
      return {
        borderColor: colors.primary[500],
        boxShadow: shadows.focus.primary,
      };
    };

    // Combine all styles
    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...getStateStyles(),
      ...style,
    };

    // Handle focus state
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    // Apply focus styles
    if (isFocused && !disabled) {
      Object.assign(combinedStyles, getFocusStyles());
    }

    // Container styles for icon positioning
    const containerStyles: React.CSSProperties = {
      position: "relative",
      display: fullWidth ? "block" : "inline-block",
      width: fullWidth ? "100%" : "auto",
    };

    // Icon styles
    const iconBaseStyles: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      color: hasError 
        ? colors.error[500] 
        : success 
        ? colors.success[500] 
        : colors.text.tertiary,
      fontSize: size === "sm" ? "0.875rem" : size === "lg" ? "1.125rem" : "1rem",
    };

    const leftIconStyles: React.CSSProperties = {
      ...iconBaseStyles,
      left: size === "sm" ? spacing[3] : size === "lg" ? spacing[5] : spacing[4],
    };

    const rightIconStyles: React.CSSProperties = {
      ...iconBaseStyles,
      right: size === "sm" ? spacing[3] : size === "lg" ? spacing[5] : spacing[4],
    };

    return (
      <div style={containerStyles}>
        {/* Left Icon */}
        {leftIcon && (
          <div style={leftIconStyles}>
            {leftIcon}
          </div>
        )}

        {/* Input Element */}
        <input
          ref={ref}
          className={className}
          style={combinedStyles}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div style={rightIconStyles}>
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

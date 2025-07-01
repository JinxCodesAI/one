/**
 * Textarea Atom Component
 * 
 * Auto-resizing textarea component inspired by AI Chat's MessageInput
 * with validation states and consistent styling.
 */

import React, { forwardRef, useEffect, useRef } from "react";
import { colors, spacing, typography, borders, shadows } from "../../tokens/index.ts";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error message to display */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Auto-resize functionality */
  autoResize?: boolean;
  /** Maximum height when auto-resizing */
  maxHeight?: string;
  /** Full width textarea */
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error,
      success = false,
      autoResize = false,
      maxHeight = "8rem",
      fullWidth = true,
      disabled = false,
      className = "",
      style = {},
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    
    const hasError = Boolean(error);

    // Auto-resize functionality (from AI Chat MessageInput)
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        const maxHeightPx = parseInt(maxHeight) * 16; // Convert rem to px (assuming 1rem = 16px)
        
        if (scrollHeight <= maxHeightPx) {
          textarea.style.height = `${scrollHeight}px`;
        } else {
          textarea.style.height = maxHeight;
          textarea.style.overflowY = "auto";
        }
      }
    }, [value, autoResize, maxHeight]);

    // Base styles
    const baseStyles: React.CSSProperties = {
      fontFamily: typography.fontFamily.sans.join(", "),
      fontWeight: typography.fontWeight.normal,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      borderRadius: borders.radius.lg,
      border: `${borders.width[2]} solid`,
      outline: "none",
      transition: "all 0.2s ease",
      resize: autoResize ? "none" : "vertical",
      width: fullWidth ? "100%" : "auto",
      minHeight: autoResize ? "2.5rem" : "6rem",
      maxHeight: autoResize ? maxHeight : "none",
      padding: `${spacing[3]} ${spacing[4]}`,
      backgroundColor: disabled ? colors.gray[50] : colors.background.primary,
      color: disabled ? colors.text.tertiary : colors.text.primary,
      cursor: disabled ? "not-allowed" : "text",
      overflowY: autoResize ? "hidden" : "auto",
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
      ...getStateStyles(),
      ...style,
    };

    // Handle focus state
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
    };

    // Apply focus styles
    if (isFocused && !disabled) {
      Object.assign(combinedStyles, getFocusStyles());
    }

    return (
      <textarea
        ref={textareaRef}
        className={className}
        style={combinedStyles}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

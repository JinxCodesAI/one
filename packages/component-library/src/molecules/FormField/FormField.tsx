/**
 * FormField Molecule Component
 * 
 * Composition of Label + Input/Textarea + Error message
 * that provides consistent form field styling and behavior.
 */

import React from "react";
import { colors, spacing, typography } from "../../tokens/index.ts";

export interface FormFieldProps {
  /** Field label */
  label: string;
  /** Whether field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Help text to display */
  helpText?: string;
  /** Success state */
  success?: boolean;
  /** Input element (Input, Textarea, Select, etc.) */
  children: React.ReactElement;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function FormField({
  label,
  required = false,
  error,
  helpText,
  success = false,
  children,
  className = "",
  style = {},
}: FormFieldProps): React.ReactElement {
  const hasError = Boolean(error);

  // Generate unique ID for accessibility
  const fieldId = React.useMemo(() => 
    `field-${Math.random().toString(36).substr(2, 9)}`, []
  );

  // Base styles
  const containerStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing[2],
    width: "100%",
    ...style,
  };

  // Label styles
  const labelStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans.join(", "),
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal,
    display: "block",
  };

  // Required indicator styles
  const requiredStyles: React.CSSProperties = {
    color: colors.error[500],
    marginLeft: spacing[1],
  };

  // Error message styles
  const errorStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans.join(", "),
    fontSize: typography.fontSize.xs,
    color: colors.error[500],
    lineHeight: typography.lineHeight.normal,
    marginTop: spacing[1],
  };

  // Help text styles
  const helpTextStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans.join(", "),
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    lineHeight: typography.lineHeight.normal,
    marginTop: spacing[1],
  };

  // Success message styles
  const successStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans.join(", "),
    fontSize: typography.fontSize.xs,
    color: colors.success[600],
    lineHeight: typography.lineHeight.normal,
    marginTop: spacing[1],
  };

  // Clone the child element to add props
  const childElement = React.cloneElement(children, {
    id: fieldId,
    error: hasError ? error : undefined,
    success: success && !hasError,
    "aria-describedby": [
      error && `${fieldId}-error`,
      helpText && `${fieldId}-help`,
      success && !hasError && `${fieldId}-success`,
    ].filter(Boolean).join(" ") || undefined,
    "aria-invalid": hasError ? "true" : undefined,
    "aria-required": required ? "true" : undefined,
  });

  return (
    <div className={`form-field ${className}`} style={containerStyles}>
      {/* Label */}
      <label htmlFor={fieldId} style={labelStyles}>
        {label}
        {required && (
          <span style={requiredStyles} aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Input Element */}
      {childElement}

      {/* Error Message */}
      {hasError && (
        <div
          id={`${fieldId}-error`}
          style={errorStyles}
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && !hasError && (
        <div
          id={`${fieldId}-success`}
          style={successStyles}
          role="status"
          aria-live="polite"
        >
          ✓ Valid
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <div
          id={`${fieldId}-help`}
          style={helpTextStyles}
        >
          {helpText}
        </div>
      )}
    </div>
  );
}

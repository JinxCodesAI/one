/**
 * Alert Molecule Component
 * 
 * Unified alert component that consolidates error handling patterns
 * from both applications with support for different variants and actions.
 */

import React from "react";
import { colors, spacing, typography, borders, shadows } from "../../tokens/index.ts";
import { Button } from "../../atoms/Button/Button.tsx";

export interface AlertProps {
  /** Alert type */
  type?: "info" | "success" | "warning" | "error";
  /** Alert variant */
  variant?: "banner" | "card" | "toast";
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Show close button */
  dismissible?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Retry handler (for error alerts) */
  onRetry?: () => void;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function Alert({
  type = "info",
  variant = "banner",
  title,
  message,
  dismissible = true,
  onClose,
  onRetry,
  icon,
  className = "",
  style = {},
}: AlertProps): React.ReactElement {
  // Default icons for each type
  const defaultIcons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  const displayIcon = icon || defaultIcons[type];

  // Color configurations
  const colorConfigs = {
    info: {
      background: colors.info[50],
      border: colors.info[200],
      text: colors.info[800],
      icon: colors.info[500],
    },
    success: {
      background: colors.success[50],
      border: colors.success[200],
      text: colors.success[800],
      icon: colors.success[500],
    },
    warning: {
      background: colors.warning[50],
      border: colors.warning[200],
      text: colors.warning[800],
      icon: colors.warning[500],
    },
    error: {
      background: colors.error[50],
      border: colors.error[200],
      text: colors.error[800],
      icon: colors.error[500],
    },
  };

  const config = colorConfigs[type];

  // Base styles
  const baseStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing[3],
    fontFamily: typography.fontFamily.sans.join(", "),
    backgroundColor: config.background,
    color: config.text,
    border: `1px solid ${config.border}`,
    position: "relative",
  };

  // Variant-specific styles
  const variantStyles: Record<string, React.CSSProperties> = {
    banner: {
      padding: `${spacing[3]} ${spacing[4]}`,
      borderRadius: "0",
      borderLeft: "none",
      borderRight: "none",
      width: "100%",
    },
    card: {
      padding: spacing[4],
      borderRadius: borders.radius.lg,
      boxShadow: shadows.sm,
      margin: spacing[4],
    },
    toast: {
      padding: spacing[4],
      borderRadius: borders.radius.lg,
      boxShadow: shadows.lg,
      minWidth: "300px",
      maxWidth: "500px",
    },
  };

  // Combine styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  // Icon styles
  const iconStyles: React.CSSProperties = {
    fontSize: typography.fontSize.lg,
    color: config.icon,
    flexShrink: 0,
    marginTop: spacing[0.5],
  };

  // Content styles
  const contentStyles: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: spacing[1],
  };

  // Title styles
  const titleStyles: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: config.text,
    margin: 0,
  };

  // Message styles
  const messageStyles: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    color: config.text,
    margin: 0,
  };

  // Actions container styles
  const actionsStyles: React.CSSProperties = {
    display: "flex",
    gap: spacing[2],
    marginTop: spacing[2],
    alignItems: "center",
  };

  // Close button styles
  const closeButtonStyles: React.CSSProperties = {
    position: "absolute",
    top: spacing[2],
    right: spacing[2],
    background: "none",
    border: "none",
    fontSize: typography.fontSize.lg,
    color: config.text,
    cursor: "pointer",
    padding: spacing[1],
    borderRadius: borders.radius.sm,
    lineHeight: "1",
    opacity: 0.7,
    transition: "opacity 0.2s ease",
  };

  const handleCloseClick = () => {
    onClose?.();
  };

  const handleRetryClick = () => {
    onRetry?.();
  };

  return (
    <div
      className={`alert alert-${type} alert-${variant} ${className}`}
      style={combinedStyles}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {displayIcon && (
        <div style={iconStyles}>
          {displayIcon}
        </div>
      )}

      {/* Content */}
      <div style={contentStyles}>
        {/* Title */}
        {title && (
          <h4 style={titleStyles}>
            {title}
          </h4>
        )}

        {/* Message */}
        <p style={messageStyles}>
          {message}
        </p>

        {/* Actions */}
        {onRetry && (
          <div style={actionsStyles}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryClick}
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Close Button */}
      {dismissible && onClose && (
        <button
          type="button"
          style={closeButtonStyles}
          onClick={handleCloseClick}
          aria-label="Close alert"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

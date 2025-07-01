/**
 * LoadingSpinner Atom Component
 * 
 * Configurable loading spinner component that consolidates loading
 * patterns from both applications with size and color variants.
 */

import React from "react";
import { colors, spacing } from "../../tokens/index.ts";

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Spinner color */
  color?: string;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function LoadingSpinner({
  size = "md",
  color,
  className = "",
  style = {},
}: LoadingSpinnerProps): React.ReactElement {
  // Size configurations
  const sizeConfig = {
    xs: {
      width: "12px",
      height: "12px",
      borderWidth: "1.5px",
    },
    sm: {
      width: "16px",
      height: "16px",
      borderWidth: "2px",
    },
    md: {
      width: "24px",
      height: "24px",
      borderWidth: "2.5px",
    },
    lg: {
      width: "32px",
      height: "32px",
      borderWidth: "3px",
    },
    xl: {
      width: "40px",
      height: "40px",
      borderWidth: "3.5px",
    },
  };

  const config = sizeConfig[size];
  
  // Default color based on context
  const defaultColor = color || colors.primary[500];
  
  // Create transparent version of the color for the border
  const transparentColor = color 
    ? `${color}20` // Add 20% opacity
    : `${colors.primary[500]}20`;

  const spinnerStyles: React.CSSProperties = {
    width: config.width,
    height: config.height,
    border: `${config.borderWidth} solid ${transparentColor}`,
    borderTop: `${config.borderWidth} solid ${defaultColor}`,
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 1s linear infinite",
    ...style,
  };

  return (
    <>
      <div
        className={`loading-spinner ${className}`}
        style={spinnerStyles}
        role="status"
        aria-label="Loading"
      />
      
      {/* CSS animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

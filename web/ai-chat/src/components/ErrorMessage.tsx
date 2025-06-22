/**
 * Error message component for displaying errors with retry functionality
 */

import React from "react";

export interface ErrorMessageProps {
  error: string;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
}

export function ErrorMessage(
  { error, onRetry, onDismiss }: ErrorMessageProps,
): React.ReactElement {
  return (
    <div
      data-testid="error-message"
      style={{
        margin: "1rem",
        padding: "1rem",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "0.5rem",
        color: "#dc2626",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: "1.25rem",
            height: "1.25rem",
            backgroundColor: "#dc2626",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          !
        </div>

        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            Error
          </h4>
          <p
            style={{
              margin: "0 0 1rem 0",
              fontSize: "0.875rem",
              lineHeight: "1.4",
            }}
          >
            {error}
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            {onRetry && (
              <button
                type="button"
                data-testid="retry-button"
                onClick={onRetry}
                style={{
                  padding: "0.375rem 0.75rem",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#b91c1c";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }}
              >
                Retry
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                data-testid="dismiss-button"
                onClick={onDismiss}
                style={{
                  padding: "0.375rem 0.75rem",
                  backgroundColor: "transparent",
                  color: "#dc2626",
                  border: "1px solid #dc2626",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                  e.currentTarget.style.color = "white";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#dc2626";
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

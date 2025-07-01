/**
 * Modal Organism Component
 * 
 * Accessible modal dialog component based on Todo App's modal patterns
 * with comprehensive keyboard navigation and focus management.
 */

import React, { useEffect, useRef } from "react";
import { colors, spacing, typography, borders, shadows, breakpoints } from "../../tokens/index.ts";
import { Button } from "../../atoms/Button/Button.tsx";

export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  footer,
  className = "",
  style = {},
}: ModalProps): React.ReactElement | null {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  // Overlay styles
  const overlayStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: spacing[4],
    animation: "modalFadeIn 0.3s ease-out",
  };

  // Size configurations
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      maxWidth: "400px",
      width: "100%",
    },
    md: {
      maxWidth: "500px",
      width: "100%",
    },
    lg: {
      maxWidth: "700px",
      width: "100%",
    },
    xl: {
      maxWidth: "900px",
      width: "100%",
    },
    full: {
      maxWidth: "95vw",
      maxHeight: "95vh",
      width: "100%",
      height: "100%",
    },
  };

  // Modal styles
  const modalStyles: React.CSSProperties = {
    backgroundColor: colors.background.primary,
    borderRadius: borders.radius.xl,
    boxShadow: shadows["2xl"],
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    outline: "none",
    animation: "modalSlideIn 0.3s ease-out",
    ...sizeStyles[size],
    ...style,
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing[6]} ${spacing[6]} ${spacing[4]} ${spacing[6]}`,
    borderBottom: `1px solid ${colors.border.primary}`,
    flexShrink: 0,
  };

  // Title styles
  const titleStyles: React.CSSProperties = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
    fontFamily: typography.fontFamily.sans.join(", "),
  };

  // Content styles
  const contentStyles: React.CSSProperties = {
    padding: spacing[6],
    overflow: "auto",
    flex: 1,
  };

  // Footer styles
  const footerStyles: React.CSSProperties = {
    padding: `${spacing[4]} ${spacing[6]} ${spacing[6]} ${spacing[6]}`,
    borderTop: `1px solid ${colors.border.primary}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing[3],
    flexShrink: 0,
  };

  // Close button styles
  const closeButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
    cursor: "pointer",
    padding: spacing[1],
    borderRadius: borders.radius.sm,
    lineHeight: "1",
    transition: "color 0.2s ease",
  };

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    onClose();
  };

  // Trap focus within modal
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  return (
    <>
      <div
        className="modal-overlay"
        style={overlayStyles}
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className={`modal modal-${size} ${className}`}
          style={modalStyles}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div style={headerStyles}>
              {title && (
                <h2 id="modal-title" style={titleStyles}>
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  style={closeButtonStyles}
                  onClick={handleCloseClick}
                  aria-label="Close modal"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.text.tertiary;
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div style={contentStyles}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div style={footerStyles}>
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @media (max-width: ${breakpoints.md}) {
            .modal {
              margin: ${spacing[2]};
              max-height: 95vh;
            }
          }
        `}
      </style>
    </>
  );
}

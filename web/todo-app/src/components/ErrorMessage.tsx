

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <div className="error-banner">
      <div className="container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <span className="error-text">{message}</span>
          {onClose && (
            <button type="button" className="error-close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      </div>
      <style>{`
        .error-banner {
          background: #fef2f2;
          border-bottom: 1px solid #fecaca;
          padding: 0.75rem 0;
          animation: slideDown 0.3s ease-out;
        }
        
        .error-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .error-icon {
          font-size: 1.25rem;
        }
        
        .error-text {
          flex: 1;
          color: #dc2626;
          font-weight: 500;
        }
        
        .error-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #dc2626;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .error-close:hover {
          background: #fecaca;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

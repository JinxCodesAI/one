/**
 * Common Loading Spinner Component
 * 
 * Displays loading spinners with configurable size and color.
 * Moved to common/ directory as part of component reorganization.
 */

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export function LoadingSpinner({ size = 'medium', color = '#3b82f6' }: LoadingSpinnerProps) {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '40px'
  };

  return (
    <div 
      className="loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderColor: `${color}20`,
        borderTopColor: color
      }}
    >
      <style>{`
        .loading-spinner {
          border: 3px solid;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Common Header Component
 * 
 * Application header with logo and version info.
 * Moved to common/ directory as part of component reorganization.
 */

export function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>✨ AI Todo</h1>
            <span className="tagline">Powered by AI & Profile Services</span>
          </div>
          <div className="header-info">
            <span className="version">v1.0</span>
          </div>
        </div>
      </div>
      <style>{`
        .header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 0;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .tagline {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 400;
        }
        
        .header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .version {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
          
          .logo h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </header>
  );
}

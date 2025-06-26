

interface StatsCardProps {
  stats: {
    total: number;
    completed: number;
    active: number;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

export function StatsCard({ stats }: StatsCardProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  const topCategories = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="card stats-card">
      <h3 className="stats-title">📊 Your Progress</h3>
      
      <div className="completion-rate">
        <div className="completion-circle">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path
              className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle"
              strokeDasharray={`${completionRate}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">
              {completionRate}%
            </text>
          </svg>
        </div>
        <div className="completion-text">
          <span className="completion-label">Completion Rate</span>
          <span className="completion-detail">
            {stats.completed} of {stats.total} tasks
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.active}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {stats.total > 0 && (
        <>
          <div className="priority-breakdown">
            <h4>By Priority</h4>
            <div className="priority-bars">
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <div key={priority} className="priority-bar">
                  <div className="priority-info">
                    <span className="priority-name">{priority}</span>
                    <span className="priority-count">{count}</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{
                        width: `${(count / stats.total) * 100}%`,
                        backgroundColor: priorityColors[priority as keyof typeof priorityColors]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {topCategories.length > 0 && (
            <div className="category-breakdown">
              <h4>Top Categories</h4>
              <div className="category-list">
                {topCategories.map(([category, count]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}</span>
                    <span className="category-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .stats-card {
          background: white;
        }
        
        .stats-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1.5rem 0;
        }
        
        .completion-rate {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .completion-circle {
          width: 80px;
          height: 80px;
        }
        
        .circular-chart {
          display: block;
          margin: 0 auto;
          max-width: 80%;
          max-height: 250px;
        }
        
        .circle-bg {
          fill: none;
          stroke: #e5e7eb;
          stroke-width: 2.8;
        }
        
        .circle {
          fill: none;
          stroke-width: 2.8;
          stroke-linecap: round;
          animation: progress 1s ease-in-out forwards;
          stroke: #3b82f6;
        }
        
        .percentage {
          fill: #1f2937;
          font-family: sans-serif;
          font-size: 0.5em;
          text-anchor: middle;
          font-weight: 600;
        }
        
        .completion-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .completion-label {
          font-weight: 600;
          color: #374151;
        }
        
        .completion-detail {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-item {
          text-align: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .priority-breakdown,
        .category-breakdown {
          margin-bottom: 1.5rem;
        }
        
        .priority-breakdown h4,
        .category-breakdown h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.75rem 0;
        }
        
        .priority-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .priority-bar {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .priority-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .priority-name {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
          text-transform: capitalize;
        }
        
        .priority-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
        }
        
        .bar-container {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 6px;
        }
        
        .category-name {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
        }
        
        .category-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          background: #e5e7eb;
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
        }
        
        @keyframes progress {
          0% {
            stroke-dasharray: 0 100;
          }
        }
      `}</style>
    </div>
  );
}

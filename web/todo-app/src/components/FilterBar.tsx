
import type { TodoFilter } from '../types.ts';

interface FilterBarProps {
  filter: TodoFilter;
  categories: string[];
  onFilterChange: (filter: TodoFilter) => void;
}

export function FilterBar({ filter, categories, onFilterChange }: FilterBarProps) {
  const handleStatusChange = (status: 'all' | 'active' | 'completed') => {
    onFilterChange({ ...filter, status });
  };

  const handlePriorityChange = (priority?: 'low' | 'medium' | 'high') => {
    onFilterChange({ ...filter, priority });
  };

  const handleCategoryChange = (category?: string) => {
    onFilterChange({ ...filter, category });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filter, search });
  };

  const clearFilters = () => {
    onFilterChange({ status: 'all', search: '' });
  };

  const hasActiveFilters = filter.priority || filter.category || filter.search;

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <div className="button-group">
            <button
              type="button"
              className={`filter-btn ${filter.status === 'all' ? 'active' : ''}`}
              onClick={() => handleStatusChange('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${filter.status === 'active' ? 'active' : ''}`}
              onClick={() => handleStatusChange('active')}
            >
              Active
            </button>
            <button
              type="button"
              className={`filter-btn ${filter.status === 'completed' ? 'active' : ''}`}
              onClick={() => handleStatusChange('completed')}
            >
              Done
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Priority</label>
          <select
            className="filter-select"
            value={filter.priority || ''}
            onChange={(e) => handlePriorityChange((e.target.value as 'low' | 'medium' | 'high') || undefined)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {categories.length > 0 && (
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={filter.category || ''}
              onChange={(e) => handleCategoryChange(e.target.value || undefined)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={filter.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="search-icon">🔍</div>
        </div>

        {hasActiveFilters && (
          <button type="button" className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <style>{`
        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        
        .filter-section {
          display: flex;
          gap: 1.5rem;
          align-items: flex-end;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .button-group {
          display: flex;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #d1d5db;
        }
        
        .filter-btn {
          background: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          border-right: 1px solid #d1d5db;
        }
        
        .filter-btn:last-child {
          border-right: none;
        }
        
        .filter-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .filter-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .search-group {
          position: relative;
        }
        
        .search-input {
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          color: #374151;
          width: 200px;
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          width: 250px;
        }
        
        .search-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .clear-filters-btn {
          background: none;
          border: 1px solid #d1d5db;
          color: #6b7280;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-filters-btn:hover {
          background: #f3f4f6;
          color: #374151;
          border-color: #9ca3af;
        }
        
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .filter-section {
            flex-wrap: wrap;
            gap: 1rem;
          }
          
          .search-section {
            justify-content: space-between;
          }
          
          .search-input {
            width: 100%;
            max-width: 200px;
          }
          
          .search-input:focus {
            width: 100%;
            max-width: 250px;
          }
        }
        
        @media (max-width: 480px) {
          .filter-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .button-group {
            width: 100%;
          }
          
          .filter-btn {
            flex: 1;
            text-align: center;
          }
          
          .filter-select {
            width: 100%;
          }
          
          .search-section {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .search-input {
            max-width: none;
          }
          
          .search-input:focus {
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}

import { useState } from 'react';
import type { TodoItemProps } from '../types.ts';

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority,
    category: todo.category || ''
  });

  const handleSave = () => {
    onEdit(todo.id, {
      title: editForm.title,
      description: editForm.description || undefined,
      priority: editForm.priority,
      category: editForm.category || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category || ''
    });
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.aiGenerated ? 'ai-generated' : ''}`}>
      <div className="todo-main">
        <div className="todo-checkbox">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="checkbox"
          />
        </div>

        <div className="todo-content">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="edit-input title-input"
                placeholder="Task title"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="edit-input description-input"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="edit-controls">
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="edit-select"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="edit-input category-input"
                  placeholder="Category"
                />
              </div>
              <div className="edit-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
                  Save
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="todo-info">
              <div className="todo-header">
                <h4 className="todo-title">{todo.title}</h4>
                <div className="todo-badges">
                  {todo.aiGenerated && (
                    <span className="badge ai-badge">✨ AI</span>
                  )}
                  <span 
                    className="badge priority-badge"
                    style={{ backgroundColor: getPriorityColor(todo.priority) }}
                  >
                    {todo.priority}
                  </span>
                  {todo.category && (
                    <span className="badge category-badge">
                      {todo.category}
                    </span>
                  )}
                </div>
              </div>
              
              {todo.description && (
                <p className="todo-description">{todo.description}</p>
              )}
              
              <div className="todo-meta">
                <span className="todo-date">
                  Created {formatDate(todo.createdAt)}
                </span>
                {todo.estimatedCredits && (
                  <span className="todo-credits">
                    💰 {todo.estimatedCredits} credits
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="todo-actions">
            <button
              type="button"
              className="action-btn edit-btn"
              onClick={() => setIsEditing(true)}
              title="Edit task"
            >
              ✏️
            </button>
            <button
              type="button"
              className="action-btn delete-btn"
              onClick={() => onDelete(todo.id)}
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <style>{`
        .todo-item {
          background: white;
          border: 2px solid #f3f4f6;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .todo-item:hover {
          border-color: #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .todo-item.completed {
          opacity: 0.7;
          background: #f9fafb;
        }
        
        .todo-item.ai-generated::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px 12px 0 0;
        }
        
        .todo-main {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        
        .todo-checkbox {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #3b82f6;
        }
        
        .todo-content {
          flex: 1;
          min-width: 0;
        }
        
        .todo-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .todo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .todo-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
        }
        
        .completed .todo-title {
          text-decoration: line-through;
          color: #6b7280;
        }
        
        .todo-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        
        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        
        .ai-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .priority-badge {
          color: white;
        }
        
        .category-badge {
          background: #e5e7eb;
          color: #374151;
        }
        
        .todo-description {
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
        }
        
        .completed .todo-description {
          text-decoration: line-through;
        }
        
        .todo-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .todo-credits {
          font-weight: 500;
          color: #f59e0b;
        }
        
        .todo-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        
        .action-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s ease;
          opacity: 0.6;
        }
        
        .action-btn:hover {
          opacity: 1;
          background: #f3f4f6;
        }
        
        .delete-btn:hover {
          background: #fef2f2;
        }
        
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .edit-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
        }
        
        .edit-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .title-input {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .description-input {
          resize: vertical;
          font-family: inherit;
        }
        
        .edit-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        
        .edit-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }
        
        .edit-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .category-input {
          font-size: 0.875rem;
        }
        
        .edit-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        
        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .todo-item {
            padding: 1rem;
          }
          
          .todo-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
          
          .todo-badges {
            align-self: flex-start;
          }
          
          .todo-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .edit-controls {
            grid-template-columns: 1fr;
          }
          
          .edit-actions {
            justify-content: stretch;
          }
          
          .btn-sm {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}

import React, { useState } from 'react';
import type { TodoFormProps, Todo } from '../types.ts';

export function TodoForm({ onSubmit, initialData, onCancel }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium' as const,
    category: initialData?.category || '',
    dueDate: initialData?.dueDate || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.category && formData.category.length > 50) {
      newErrors.category = 'Category must be less than 50 characters';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        category: formData.category.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        completed: false,
        aiGenerated: false
      };

      onSubmit(todoData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel?.()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Task</h3>
          {onCancel && (
            <button type="button" className="modal-close" onClick={onCancel}>
              ×
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What needs to be done?"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.title && <div className="text-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className={`textarea ${errors.description ? 'input-error' : ''}`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add more details about this task..."
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && <div className="text-error">{errors.description}</div>}
            <div className="character-count">
              {formData.description.length}/500
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                className="select"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                className={`input ${errors.category ? 'input-error' : ''}`}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Work, Personal, Health"
                maxLength={50}
                disabled={isSubmitting}
              />
              {errors.category && <div className="text-error">{errors.category}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date (Optional)</label>
            <input
              id="dueDate"
              type="date"
              className={`input ${errors.dueDate ? 'input-error' : ''}`}
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
            />
            {errors.dueDate && <div className="text-error">{errors.dueDate}</div>}
          </div>

          {errors.submit && (
            <div className="text-error" style={{ marginBottom: '1rem' }}>
              {errors.submit}
            </div>
          )}

          <div className="modal-footer">
            {onCancel && (
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .character-count {
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: right;
          margin-top: 0.25rem;
        }
        
        .required {
          color: #ef4444;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

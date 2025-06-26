import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { aiService } from '../services/aiService.ts';
import type { AITaskSuggestion } from '../types.ts';

interface AIAssistantProps {
  onGenerateTasks: (suggestions: AITaskSuggestion[]) => void;
  creditsBalance: number;
  onClose: () => void;
}

export function AIAssistant({ onGenerateTasks, creditsBalance, onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [taskCount, setTaskCount] = useState(3);
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const estimatedCost = taskCount * 2; // Rough estimate: 2 credits per task

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (creditsBalance < estimatedCost) {
      setError(`Not enough credits. Need ${estimatedCost}, have ${creditsBalance}`);
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuggestions([]);

    try {
      const newSuggestions = await aiService.generateTaskSuggestions({
        prompt: prompt.trim(),
        context: context.trim() || undefined,
        taskCount
      });

      setSuggestions(newSuggestions);
      // Select all suggestions by default
      setSelectedSuggestions(new Set(newSuggestions.map((_: AITaskSuggestion, index: number) => index)));
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate task suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelection = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleCreateTasks = () => {
    const selectedTasks = suggestions.filter((_: AITaskSuggestion, index: number) => selectedSuggestions.has(index));
    if (selectedTasks.length === 0) {
      setError('Please select at least one task to create');
      return;
    }

    onGenerateTasks(selectedTasks);
  };

  const selectedCost = suggestions
    .filter((_: AITaskSuggestion, index: number) => selectedSuggestions.has(index))
    .reduce((sum: number, suggestion: AITaskSuggestion) => sum + suggestion.estimatedCredits, 0);

  const quickPrompts = [
    "Help me organize my work week",
    "Plan a healthy lifestyle routine",
    "Prepare for a job interview",
    "Learn a new programming language",
    "Organize my home office",
    "Plan a weekend project"
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal ai-assistant-modal">
        <div className="modal-header">
          <h3>✨ AI Task Assistant</h3>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="ai-content">
          <div className="credits-info">
            <span className="credits-balance">💰 {creditsBalance} credits available</span>
            <span className="estimated-cost">
              Estimated cost: {selectedSuggestions.size > 0 ? selectedCost : estimatedCost} credits
            </span>
          </div>

          {!suggestions.length && (
            <div className="input-section">
              <div className="form-group">
                <label htmlFor="prompt">What would you like help with?</label>
                <textarea
                  id="prompt"
                  className="textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to accomplish..."
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              <div className="quick-prompts">
                <label>Quick ideas:</label>
                <div className="prompt-buttons">
                  {quickPrompts.map((quickPrompt: string, index: number) => (
                    <button
                      key={index}
                      type="button"
                      className="prompt-btn"
                      onClick={() => setPrompt(quickPrompt)}
                      disabled={isGenerating}
                    >
                      {quickPrompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="taskCount">Number of tasks</label>
                  <select
                    id="taskCount"
                    className="select"
                    value={taskCount}
                    onChange={(e) => setTaskCount(Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <option value={1}>1 task</option>
                    <option value={2}>2 tasks</option>
                    <option value={3}>3 tasks</option>
                    <option value={4}>4 tasks</option>
                    <option value={5}>5 tasks</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="context">Context (optional)</label>
                  <input
                    id="context"
                    type="text"
                    className="input"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g., I'm a beginner, I have 2 hours"
                    disabled={isGenerating}
                  />
                </div>
              </div>

              {error && <div className="text-error">{error}</div>}

              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || creditsBalance < estimatedCost}
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Generating tasks...
                  </>
                ) : (
                  `Generate ${taskCount} Task${taskCount > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <h4>Generated Tasks</h4>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSuggestions([]);
                    setSelectedSuggestions(new Set());
                    setError('');
                  }}
                >
                  Generate New
                </button>
              </div>

              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${selectedSuggestions.has(index) ? 'selected' : ''}`}
                  >
                    <div className="suggestion-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.has(index)}
                        onChange={() => handleToggleSelection(index)}
                      />
                    </div>
                    <div className="suggestion-content">
                      <h5 className="suggestion-title">{suggestion.title}</h5>
                      {suggestion.description && (
                        <p className="suggestion-description">{suggestion.description}</p>
                      )}
                      <div className="suggestion-meta">
                        <span className={`priority-badge priority-${suggestion.priority}`}>
                          {suggestion.priority}
                        </span>
                        {suggestion.category && (
                          <span className="category-badge">{suggestion.category}</span>
                        )}
                        <span className="credits-badge">
                          💰 {suggestion.estimatedCredits}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && <div className="text-error">{error}</div>}

              <div className="suggestions-footer">
                <div className="selection-info">
                  {selectedSuggestions.size} of {suggestions.length} tasks selected
                  {selectedSuggestions.size > 0 && (
                    <span className="total-cost"> • {selectedCost} credits total</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCreateTasks}
                  disabled={selectedSuggestions.size === 0 || creditsBalance < selectedCost}
                >
                  Create Selected Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ai-assistant-modal {
          max-width: 600px;
          max-height: 80vh;
        }
        
        .ai-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .credits-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          font-size: 0.875rem;
        }
        
        .credits-balance {
          font-weight: 600;
          color: #0369a1;
        }
        
        .estimated-cost {
          color: #6b7280;
        }
        
        .input-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .quick-prompts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .quick-prompts label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .prompt-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .prompt-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .prompt-btn:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
        
        .prompt-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-full {
          width: 100%;
        }
        
        .suggestions-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .suggestions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .suggestions-header h4 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }
        
        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .suggestion-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .suggestion-item:hover {
          border-color: #d1d5db;
        }
        
        .suggestion-item.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .suggestion-checkbox {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .suggestion-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .suggestion-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .suggestion-description {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }
        
        .suggestion-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .priority-badge,
        .category-badge,
        .credits-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .priority-high {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .priority-medium {
          background: #fffbeb;
          color: #d97706;
        }
        
        .priority-low {
          background: #f0fdf4;
          color: #16a34a;
        }
        
        .category-badge {
          background: #f3f4f6;
          color: #374151;
        }
        
        .credits-badge {
          background: #fef3c7;
          color: #d97706;
        }
        
        .suggestions-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .selection-info {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .total-cost {
          font-weight: 600;
          color: #d97706;
        }
        
        @media (max-width: 480px) {
          .ai-assistant-modal {
            margin: 0.5rem;
            max-height: 90vh;
          }
          
          .suggestions-footer {
            flex-direction: column;
            gap: 0.75rem;
            align-items: stretch;
          }
          
          .prompt-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Model selector component for choosing AI models
 */

import React from "react";

export interface ModelSelectorProps {
  availableModels: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ 
  availableModels, 
  selectedModel, 
  onModelChange 
}: ModelSelectorProps): React.ReactElement {
  if (availableModels.length === 0) {
    return (
      <div style={{ 
        padding: '0.75rem 1.5rem', 
        fontSize: '0.875rem', 
        color: '#6b7280',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb'
      }}>
        Loading models...
      </div>
    );
  }

  return (
    <div style={{
      padding: '0.75rem 1.5rem',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <label style={{
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151'
      }}>
        Model:
      </label>
      
      <select
        data-testid="model-selector"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        style={{
          padding: '0.375rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          backgroundColor: 'white',
          fontSize: '0.875rem',
          color: '#374151',
          cursor: 'pointer',
          minWidth: '200px'
        }}
      >
        {availableModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      
      <div style={{
        fontSize: '0.75rem',
        color: '#6b7280',
        marginLeft: 'auto'
      }}>
        {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
      </div>
    </div>
  );
}

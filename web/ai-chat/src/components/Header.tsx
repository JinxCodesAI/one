/**
 * Header component for the AI Chat application
 */

import React from "react";

export interface HeaderProps {
  selectedModel: string;
  onClearConversation: () => void;
}

export function Header({ selectedModel, onClearConversation }: HeaderProps): React.ReactElement {
  return (
    <header style={{
      padding: '1rem 1.5rem',
      backgroundColor: '#1f2937',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #374151'
    }}>
      <div>
        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          AI Chat
        </h1>
        <p style={{
          margin: '0.25rem 0 0 0',
          fontSize: '0.875rem',
          color: '#9ca3af'
        }}>
          Using {selectedModel}
        </p>
      </div>
      
      <button
        onClick={onClearConversation}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#4b5563';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
        }}
      >
        Clear Chat
      </button>
    </header>
  );
}

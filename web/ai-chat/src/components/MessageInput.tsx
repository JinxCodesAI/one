/**
 * Message input component for sending messages
 */

import React, { useState, useRef, useEffect } from "react";

export interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps): React.ReactElement {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || disabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(inputValue);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = disabled || isSubmitting;

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb'
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
        <textarea
          ref={textareaRef}
          data-testid="message-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDisabled ? "Please wait..." : "Type your message... (Press Enter to send, Shift+Enter for new line)"}
          disabled={isDisabled}
          style={{
            flex: 1,
            minHeight: '2.5rem',
            maxHeight: '8rem',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.4',
            resize: 'none',
            outline: 'none',
            backgroundColor: isDisabled ? '#f9fafb' : 'white',
            color: isDisabled ? '#6b7280' : '#374151',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onFocus={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        
        <button
          type="submit"
          data-testid="send-button"
          disabled={isDisabled || !inputValue.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isDisabled || !inputValue.trim() ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isDisabled || !inputValue.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            alignSelf: 'flex-end'
          }}
          onMouseOver={(e) => {
            if (!isDisabled && inputValue.trim()) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }
          }}
          onMouseOut={(e) => {
            if (!isDisabled && inputValue.trim()) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

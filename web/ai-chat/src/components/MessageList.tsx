/**
 * Message list component for displaying chat messages
 */

import React from "react";
import type { Message } from "../types.ts";

export interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps): React.ReactElement {
  if (messages.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        Start a conversation by typing a message below
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} index={index} />
      ))}
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  index: number;
}

function MessageItem({ message, index }: MessageItemProps): React.ReactElement {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const backgroundColor = isUser ? '#2563eb' : isSystem ? '#dc2626' : '#f3f4f6';
  const textColor = isUser || isSystem ? 'white' : '#374151';
  const alignment = isUser ? 'flex-end' : 'flex-start';

  return (
    <div
      data-testid={`message-${index}`}
      data-role={message.role}
      style={{
        display: 'flex',
        justifyContent: alignment,
        width: '100%'
      }}
    >
      <div style={{
        maxWidth: '70%',
        padding: '0.75rem 1rem',
        backgroundColor,
        color: textColor,
        borderRadius: isUser ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
        fontSize: '0.875rem',
        lineHeight: '1.5',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}>
        <div style={{ marginBottom: '0.25rem' }}>
          {message.content}
        </div>
        <div style={{
          fontSize: '0.75rem',
          opacity: 0.7,
          marginTop: '0.5rem'
        }}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}

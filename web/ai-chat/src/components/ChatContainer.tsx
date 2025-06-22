/**
 * Chat container component that manages the chat interface
 */

import React, { useEffect, useRef } from "react";
import { MessageList } from "./MessageList.tsx";
import { MessageInput } from "./MessageInput.tsx";
import { ErrorMessage } from "./ErrorMessage.tsx";
import type { Message } from "../types.ts";

export interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onRetry?: () => Promise<void>;
  onDismissError?: () => void;
}

export function ChatContainer({
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetry,
  onDismissError,
}: ChatContainerProps): React.ReactElement {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      const container = messagesEndRef.current.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Welcome message when no messages */}
        {messages.length === 0 && !isLoading && !error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                  color: "#374151",
                }}
              >
                Welcome to AI Chat
              </h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                Start a conversation by typing a message below
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <>
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem",
              color: "#6b7280",
              fontSize: "0.875rem",
            }}
          >
            <div
              style={{
                width: "1rem",
                height: "1rem",
                border: "2px solid #e5e7eb",
                borderTop: "2px solid #2563eb",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            AI is thinking...
          </div>
        )}

        {/* Error message */}
        {error && (
          <ErrorMessage
            error={error}
            onRetry={onRetry}
            onDismiss={onDismissError}
          />
        )}
      </div>

      {/* Input area */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}

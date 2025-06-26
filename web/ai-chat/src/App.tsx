/**
 * Main App component for AI Chat v2
 */

import React from "react";
import { ChatContainer } from "./components/ChatContainer.tsx";
import { ModelSelector } from "./components/ModelSelector.tsx";
import { Header } from "./components/Header.tsx";
import { useChat } from "./hooks/useChat.ts";
import "./App.css";

export default function App(): React.ReactElement {
  const {
    messages,
    selectedModel,
    availableModels,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    changeModel,
    retryLastMessage,
  } = useChat({
    initialModel: "gpt-4.1-nano",
    maxMessages: 50,
  });

  const dismissError = (): void => {
    // Error will be cleared on next successful message or manual clear
  };

  return (
    <div className="app-container">
      <Header
        selectedModel={selectedModel}
        onClearConversation={clearConversation}
      />

      <ModelSelector
        availableModels={availableModels}
        selectedModel={selectedModel}
        onModelChange={changeModel}
      />

      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={sendMessage}
        onRetry={retryLastMessage}
        onDismissError={dismissError}
      />
    </div>
  );
}

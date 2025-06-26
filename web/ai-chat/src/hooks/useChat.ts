/**
 * Custom hook for managing chat state and functionality
 */

import { useCallback, useEffect, useState } from "react";
import { aiClient } from "../services/aiClient.ts";
import type { ChatOptions, Message, UseChatReturn } from "../types.ts";

/**
 * Custom hook for chat functionality
 */
export function useChat(options: ChatOptions = {}): UseChatReturn {
  const { initialModel = "gpt-4.1-nano", maxMessages = 100 } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Load available models on mount
  useEffect(() => {
    loadAvailableModels();
  }, []);

  /**
   * Load available models from the AI service
   */
  const loadAvailableModels = useCallback(async () => {
    try {
      const models = await aiClient.getModels();
      setAvailableModels(models);

      // If selected model is not in the list, use the first available model
      if (models.length > 0 && !models.includes(selectedModel)) {
        setSelectedModel(models[0]);
      }
    } catch (error) {
      console.error("Failed to load models:", error);
      setError("Failed to load available models");
    }
  }, [selectedModel]);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setLastUserMessage(content.trim());

    try {
      const allMessages = [...messages, userMessage];

      // Limit conversation history to prevent token limits
      const recentMessages = allMessages.slice(-maxMessages);

      const response = await aiClient.generateText(
        recentMessages,
        selectedModel,
        {
          maxTokens: 2000,
          temperature: 0.7,
        },
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to send message";
      setError(errorMessage);

      // Add error message to chat
      const errorChatMessage: Message = {
        role: "system",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, selectedModel, maxMessages, isLoading]);

  /**
   * Clear the conversation
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastUserMessage(null);
  }, []);

  /**
   * Change the selected model
   */
  const changeModel = useCallback((model: string) => {
    setSelectedModel(model);
    setError(null);
  }, []);

  /**
   * Retry the last message
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage) return;

    // Remove the last assistant message if it exists and was an error
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (
        lastMessage &&
        (lastMessage.role === "assistant" || lastMessage.role === "system")
      ) {
        return prev.slice(0, -1);
      }
      return prev;
    });

    await sendMessage(lastUserMessage);
  }, [lastUserMessage, sendMessage]);

  return {
    messages,
    selectedModel,
    availableModels,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    changeModel,
    retryLastMessage,
  };
}

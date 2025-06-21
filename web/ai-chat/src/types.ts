/**
 * Core types and interfaces for the AI Chat application
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatOptions {
  initialModel?: string;
  maxMessages?: number;
}

export interface ChatState {
  messages: Message[];
  selectedModel: string;
  availableModels: string[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  changeModel: (model: string) => void;
  retryLastMessage: () => Promise<void>;
}

export type UseChatReturn = ChatState & ChatActions;

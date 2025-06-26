// Core Todo Types
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  aiGenerated?: boolean;
  estimatedCredits?: number;
}

export interface TodoFilter {
  status: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  search?: string;
}

// User Profile Types (from Profile Service)
export interface UserProfile {
  anonId: string;
  userId?: string | null;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Credits {
  balance: number;
  ledger: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: 'daily_bonus' | 'spend' | 'earn' | 'adjustment';
  reason: string;
  ts: string;
}

// AI Types
export interface AITaskSuggestion {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  estimatedCredits: number;
}

export interface AIGenerationRequest {
  prompt: string;
  context?: string;
  taskCount?: number;
}

// App State Types
export interface AppState {
  user: UserProfile | null;
  credits: Credits | null;
  todos: Todo[];
  filter: TodoFilter;
  loading: {
    profile: boolean;
    credits: boolean;
    todos: boolean;
    ai: boolean;
  };
  error: string | null;
}

// Component Props Types
export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export interface TodoFormProps {
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<Todo>;
  onCancel?: () => void;
}

export interface ProfileCardProps {
  profile: UserProfile;
  credits: Credits;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClaimBonus: () => void;
}

export interface AIAssistantProps {
  onGenerateTasks: (suggestions: AITaskSuggestion[]) => void;
  creditsBalance: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Environment Types
export interface AppConfig {
  aiApiUrl: string;
  profileApiUrl: string;
  isDevelopment: boolean;
}

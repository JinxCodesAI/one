
import { TodoItem } from './TodoItem.tsx';
import type { Todo } from '../types.ts';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onEdit, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return null;
  }

  // Group todos by completion status
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="todo-list">
      {activeTodos.length > 0 && (
        <div className="todo-section">
          <h3 className="section-title">
            Active Tasks ({activeTodos.length})
          </h3>
          <div className="todo-items">
            {activeTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {completedTodos.length > 0 && (
        <div className="todo-section">
          <h3 className="section-title">
            Completed Tasks ({completedTodos.length})
          </h3>
          <div className="todo-items completed-section">
            {completedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .todo-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .todo-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin: 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f3f4f6;
        }
        
        .todo-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .completed-section {
          opacity: 0.8;
        }
        
        @media (max-width: 768px) {
          .todo-list {
            gap: 1.5rem;
          }
          
          .section-title {
            font-size: 1rem;
          }
          
          .todo-items {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

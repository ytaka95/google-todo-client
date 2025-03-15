import React from 'react';
import { TodoItem as TodoItemType } from '../types/todo';
import { formatDate } from '../utils/date';

interface TodoItemProps {
  todo: TodoItemType;
  onToggleComplete: (id: string, completed: boolean) => void;
  onOpenDetail: (todo: TodoItemType) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onOpenDetail }) => {
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(todo.id, !todo.completed);
  };

  const handleClick = () => {
    onOpenDetail(todo);
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`} onClick={handleClick}>
      <div className="todo-checkbox-container">
        <button 
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={handleToggleComplete}
          aria-label={todo.completed ? "未完了に戻す" : "完了としてマーク"}
        >
          {todo.completed && <span className="checkmark">✓</span>}
        </button>
      </div>
      
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        
        {todo.due && (
          <div className="todo-due-date">
            {formatDate(todo.due)}
          </div>
        )}
        
        {todo.notes && (
          <div className="todo-notes">
            {todo.notes.length > 100 ? `${todo.notes.substring(0, 100)}...` : todo.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTodoStart, addTodoSuccess, updateTodoStart, updateTodoSuccess, deleteTodoStart, deleteTodoSuccess } from '../features/todos/todosSlice';
import { TodoItem } from '../types/todo';
import { addTodo, updateTodo, deleteTodo } from '../services/todoApi';
import { formatDate } from '../utils/date';

interface TodoModalProps {
  todo: TodoItem | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onEdit: () => void;
}

const TodoModal: React.FC<TodoModalProps> = ({ todo, mode, onClose, onEdit }) => {
  const dispatch = useDispatch();
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);
  
  // モード変更時やtodo変更時にフォームを初期化
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setNotes(todo.notes || '');
      setDueDate(todo.due ? todo.due.substring(0, 10) : ''); // YYYY-MM-DD形式に変換
      setCompleted(todo.completed);
    } else {
      setTitle('');
      setNotes('');
      setDueDate('');
      setCompleted(false);
    }
  }, [todo, mode]);
  
  // 追加処理
  const handleAdd = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    try {
      dispatch(addTodoStart());
      
      const newTodo = await addTodo({
        title: title.trim(),
        notes: notes.trim() || undefined,
        due: dueDate ? new Date(dueDate).toISOString() : undefined,
        completed: false
      });
      
      dispatch(addTodoSuccess(newTodo));
      onClose();
    } catch (error) {
      console.error('Failed to add todo:', error);
      // エラー処理を追加
    }
  };
  
  // 更新処理
  const handleUpdate = async () => {
    if (!todo || !title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    try {
      dispatch(updateTodoStart());
      
      const updatedTodo = await updateTodo(todo.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        due: dueDate ? new Date(dueDate).toISOString() : undefined,
        completed
      });
      
      dispatch(updateTodoSuccess(updatedTodo));
      onClose();
    } catch (error) {
      console.error('Failed to update todo:', error);
      // エラー処理を追加
    }
  };
  
  // 削除処理
  const handleDelete = async () => {
    if (!todo) return;
    
    if (window.confirm('このTODOを削除してもよろしいですか？')) {
      try {
        dispatch(deleteTodoStart());
        await deleteTodo(todo.id);
        dispatch(deleteTodoSuccess(todo.id));
        onClose();
      } catch (error) {
        console.error('Failed to delete todo:', error);
        // エラー処理を追加
      }
    }
  };
  
  // 完了状態の切り替え
  const handleToggleComplete = async () => {
    if (!todo) return;
    
    try {
      dispatch(updateTodoStart());
      
      const updatedTodo = await updateTodo(todo.id, {
        completed: !completed
      });
      
      dispatch(updateTodoSuccess(updatedTodo));
      setCompleted(!completed);
    } catch (error) {
      console.error('Failed to update todo:', error);
      // エラー処理を追加
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="modal-header">
          <h2>
            {mode === 'add' ? 'ToDo追加' : 
             mode === 'edit' ? 'ToDo編集' : 'ToDo詳細'}
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* モーダル本体 */}
        <div className="modal-body">
          {/* 表示モード */}
          {mode === 'view' && todo && (
            <>
              <div className="todo-detail-header">
                <button 
                  className={`todo-checkbox large ${completed ? 'checked' : ''}`}
                  onClick={handleToggleComplete}
                >
                  {completed && <span className="checkmark">✓</span>}
                </button>
                <h3>{title}</h3>
              </div>
              
              {dueDate && (
                <div className="todo-detail-due">
                  <strong>期限:</strong> {formatDate(dueDate)}
                </div>
              )}
              
              {notes && (
                <div className="todo-detail-notes">
                  <pre>{notes}</pre>
                </div>
              )}
            </>
          )}
          
          {/* 編集・追加モード */}
          {(mode === 'edit' || mode === 'add') && (
            <form>
              <div className="form-group">
                <label htmlFor="title">タイトル *</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="dueDate">期限</label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">メモ</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </form>
          )}
        </div>
        
        {/* モーダルフッター */}
        <div className="modal-footer">
          {mode === 'view' && (
            <>
              <button className="delete-button" onClick={handleDelete}>削除</button>
              <button className="edit-button" onClick={onEdit}>編集</button>
            </>
          )}
          
          {mode === 'edit' && (
            <>
              <button className="cancel-button" onClick={onClose}>キャンセル</button>
              <button className="save-button" onClick={handleUpdate}>保存</button>
            </>
          )}
          
          {mode === 'add' && (
            <>
              <button className="cancel-button" onClick={onClose}>キャンセル</button>
              <button className="add-button" onClick={handleAdd}>追加</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoModal;
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { fetchTodosStart, fetchTodosSuccess, fetchTodosFailure, updateTodoStart, updateTodoSuccess } from '../features/todos/todosSlice';
import TodoItem from './TodoItem';
import TodoModal from './TodoModal';
import { TodoItem as TodoItemType } from '../types/todo';
import { fetchTodos, updateTodo } from '../services/todoApi';

const TodoList: React.FC = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.todos);
  
  const [selectedTodo, setSelectedTodo] = useState<TodoItemType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  
  // 初回マウント時のデータ取得は App.tsx で実装されているので、ここでは実装しない
  // ブラウザの更新ボタンが押された時やタブがアクティブになった時の同期も App.tsx で処理
  
  // 完了状態の切り替え
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      dispatch(updateTodoStart());
      const updatedTodo = await updateTodo(id, { completed });
      dispatch(updateTodoSuccess(updatedTodo));
    } catch (error) {
      console.error('Failed to update todo:', error);
      // エラー処理を追加
    }
  };
  
  // 詳細モーダルを開く
  const handleOpenDetail = (todo: TodoItemType) => {
    setSelectedTodo(todo);
    setModalMode('view');
    setIsModalOpen(true);
  };
  
  // 新規追加モーダルを開く
  const handleAddNew = () => {
    setSelectedTodo(null);
    setModalMode('add');
    setIsModalOpen(true);
  };
  
  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // 編集モードに切り替え
  const handleSwitchToEdit = () => {
    setModalMode('edit');
  };
  
  // ログアウト処理は LogoutPage コンポーネントに移動
  
  if (loading && items.length === 0) {
    return <div className="loading">読み込み中...</div>;
  }
  
  if (error) {
    return <div className="error">エラー: {error}</div>;
  }
  
  return (
    <div className="todo-list-container">
      <div className="todo-header">
        <h1>ToDo一覧</h1>
        <Link to="/logout" className="logout-button">
          ログアウト
        </Link>
      </div>
      
      <div className="todo-list">
        {items.length === 0 ? (
          <div className="empty-list">TODOがありません。新しいTODOを追加してください。</div>
        ) : (
          items.map(todo => (
            <TodoItem 
              key={todo.id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onOpenDetail={handleOpenDetail}
            />
          ))
        )}
      </div>
      
      <button className="add-todo-button" onClick={handleAddNew}>
        + 追加
      </button>
      
      {isModalOpen && (
        <TodoModal
          todo={selectedTodo}
          mode={modalMode}
          onClose={handleCloseModal}
          onEdit={handleSwitchToEdit}
        />
      )}
    </div>
  );
};

export default TodoList;
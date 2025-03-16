import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchTodosStart, fetchTodosSuccess, fetchTodosFailure, updateTodoStart, updateTodoSuccess } from '../features/todos/todosSlice';
import { logout } from '../features/auth/authSlice';
import TodoItem from './TodoItem';
import TodoModal from './TodoModal';
import { TodoItem as TodoItemType } from '../types/todo';
import { fetchTodos, updateTodo } from '../services/todoApi';
import { signOut } from '../services/auth';

const TodoList: React.FC = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.todos);
  
  const [selectedTodo, setSelectedTodo] = useState<TodoItemType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  
  // 初回マウント時にTODOデータを取得
  useEffect(() => {
    const loadTodos = async () => {
      try {
        dispatch(fetchTodosStart());
        const todos = await fetchTodos();
        dispatch(fetchTodosSuccess(todos));
      } catch (error) {
        console.error('Failed to fetch todos:', error);
        dispatch(fetchTodosFailure(error instanceof Error ? error.message : 'TODOの取得に失敗しました'));
      }
    };
    
    loadTodos();
  }, [dispatch]);
  
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
  
  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(logout());
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
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
        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
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
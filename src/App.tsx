import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { loginSuccess } from './features/auth/authSlice';
import LoginPage from './components/LoginPage';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // ローカルストレージから認証情報を読み込む（自動ログイン）
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('user_info');
    
    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        dispatch(loginSuccess({
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          imageUrl: userInfo.picture
        }));
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
        localStorage.removeItem('user_info');
      }
    }
  }, [dispatch]);

  // ローディング中
  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="app">
      {isAuthenticated ? <TodoList /> : <LoginPage />}
    </div>
  );
}

export default App;

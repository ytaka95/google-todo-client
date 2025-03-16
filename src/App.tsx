import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { loginSuccess } from './features/auth/authSlice';
import LoginPage from './components/LoginPage';
import TodoList from './components/TodoList';
import { initGoogleAuth, initGapiClient, getAccessToken } from './services/auth';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // アプリ起動時にGoogle APIクライアントを初期化
  useEffect(() => {
    const initApi = async () => {
      try {
        // Google認証用のライブラリを読み込む
        await initGoogleAuth();
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
      }
    };
    
    initApi();
  }, []);

  // ローカルストレージから認証情報を読み込む（自動ログイン）
  useEffect(() => {
    const autoLogin = async () => {
      const storedUserInfo = localStorage.getItem('user_info');
      const accessToken = getAccessToken();
      
      if (storedUserInfo && accessToken) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          dispatch(loginSuccess({
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            imageUrl: userInfo.picture
          }));
          
          // Google Tasks APIを使用するためのGAPIクライアントを初期化
          try {
            await initGapiClient();
          } catch (apiError) {
            console.warn('GAPI Client initialization failed:', apiError);
          }
        } catch (error) {
          console.error('Failed to parse stored user info:', error);
          localStorage.removeItem('user_info');
        }
      }
    };
    
    autoLogin();
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

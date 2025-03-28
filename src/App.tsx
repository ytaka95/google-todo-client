import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { loginSuccess } from './features/auth/authSlice';
import { fetchTodosSuccess, fetchTodosStart, fetchTodosFailure } from './features/todos/todosSlice';
import LoginPage from './components/LoginPage';
import TodoList from './components/TodoList';
import { initGoogleAuth, initGapiClient, getAccessToken } from './services/auth';
import { fetchTodos } from './services/todoApi';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // アプリ起動時にGoogle APIクライアントを初期化
  useEffect(() => {
    let isMounted = true;
    
    const initApi = async () => {
      try {
        console.log('Initializing Google API...');
        // Google認証用のライブラリを読み込む
        await initGoogleAuth();
        console.log('Google API initialized successfully');
        
        // アクセストークンがある場合はGAPIクライアントも初期化
        const token = getAccessToken();
        if (token && isMounted) {
          try {
            console.log('Initializing GAPI client with token...');
            await initGapiClient();
            console.log('GAPI client initialized successfully');
          } catch (gapiError) {
            console.warn('Failed to initialize GAPI client:', gapiError);
            // GAPIクライアントの初期化エラーは致命的ではないので、
            // ユーザーには通知せずに続行
          }
        }
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
        // 認証ライブラリの読み込みエラーはログに記録するだけ
        // ユーザーがログインボタンをクリックした時点で再試行する
      }
    };
    
    initApi();
    
    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, []);

  // ローカルストレージから認証情報を読み込む（自動ログイン）
  useEffect(() => {
    let isMounted = true;
    
    const autoLogin = async () => {
      const storedUserInfo = localStorage.getItem('user_info');
      const accessToken = getAccessToken();
      
      if (storedUserInfo && accessToken) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          
          // 想定された形式のユーザー情報かチェック
          if (!userInfo.id || !userInfo.name || !userInfo.email) {
            console.error('Invalid user info format in localStorage');
            localStorage.removeItem('user_info');
            return;
          }
          
          // ユーザー情報をストアに保存
          if (isMounted) {
            dispatch(loginSuccess({
              id: userInfo.id,
              name: userInfo.name,
              email: userInfo.email,
              imageUrl: userInfo.picture
            }));
          }
          
          // Google Tasks APIを使用するためのGAPIクライアントを初期化
          if (isMounted) {
            try {
              console.log('Auto login: Initializing GAPI client...');
              await initGapiClient();
              console.log('Auto login: GAPI client initialized successfully');
            } catch (apiError) {
              console.warn('Auto login: GAPI Client initialization failed:', apiError);
              // GAPIクライアントの初期化エラーは致命的ではないので続行
            }
          }
        } catch (error) {
          console.error('Failed to parse stored user info:', error);
          localStorage.removeItem('user_info');
        }
      } else {
        // ストレージに情報がない、またはトークンがない場合はログアウト状態と判断
        console.log('No stored user info or token found for auto login');
      }
    };
    
    autoLogin();
    
    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // ブラウザの更新ボタンが押された時にデータを同期する
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // タブがアクティブになった時にデータを同期
        try {
          dispatch(fetchTodosStart());
          const todos = await fetchTodos();
          dispatch(fetchTodosSuccess(todos));
        } catch (error) {
          console.error('Failed to sync todos on visibility change:', error);
          dispatch(fetchTodosFailure(error instanceof Error ? error.message : 'TODOの同期に失敗しました'));
        }
      }
    };

    const handlePageRefresh = async () => {
      try {
        dispatch(fetchTodosStart());
        const todos = await fetchTodos();
        dispatch(fetchTodosSuccess(todos));
      } catch (error) {
        console.error('Failed to sync todos on page load:', error);
        dispatch(fetchTodosFailure(error instanceof Error ? error.message : 'TODOの同期に失敗しました'));
      }
    };

    // 初回ロード時に同期
    handlePageRefresh();
    
    // タブの表示状態変更イベントをリッスン
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // beforeunload イベントでリフレッシュ検知（参考用）
    window.addEventListener('beforeunload', () => {
      // ここでは実際に何もしない（リフレッシュ後に handlePageRefresh が動作する）
      console.log('Page is refreshing...');
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, dispatch]);

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

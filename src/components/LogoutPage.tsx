import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../services/auth';
import { logout } from '../features/auth/authSlice';

const LogoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // APIサービスのログアウト処理を呼び出す
        await signOut();
        
        // Reduxストアのログアウト処理を呼び出す
        dispatch(logout());
        
        // ログアウト後はログインページへリダイレクト
        navigate('/');
      } catch (error) {
        console.error('Logout failed:', error);
        // エラーが発生してもログインページに戻る
        navigate('/');
      }
    };

    performLogout();
  }, [dispatch, navigate]);

  // ログアウト中の表示
  return (
    <div className="logout-page">
      <p>ログアウト中...</p>
    </div>
  );
};

export default LogoutPage;
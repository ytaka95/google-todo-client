import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { signInWithGoogle, GoogleUserInfo } from '../services/auth';

const LoginButton: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      dispatch(loginStart());
      
      // Google認証を実行
      const userInfo: GoogleUserInfo = await signInWithGoogle();
      
      // Redux storeに認証情報を保存
      dispatch(loginSuccess({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        imageUrl: userInfo.picture
      }));
      
      // ユーザー情報をローカルストレージに保存（次回自動ログイン用）
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      
    } catch (error) {
      console.error('Login failed:', error);
      dispatch(loginFailure(error instanceof Error ? error.message : '認証エラーが発生しました'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="login-button"
    >
      {isLoading ? 'ログイン中...' : 'Googleでログイン'}
    </button>
  );
};

export default LoginButton;
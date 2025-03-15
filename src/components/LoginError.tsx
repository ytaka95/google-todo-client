import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { loginFailure } from '../features/auth/authSlice';

const LoginError: React.FC = () => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.auth.error);
  
  const handleReturnToLogin = () => {
    // エラーメッセージをクリアしてログイン画面に戻る
    dispatch(loginFailure(null));
  };
  
  return (
    <div className="login-error">
      <h2>ログインエラー</h2>
      <div className="error-message">
        <p>認証中にエラーが発生しました。</p>
        <p className="error-details">{error}</p>
      </div>
      <button onClick={handleReturnToLogin} className="return-button">
        ログイン画面へ戻る
      </button>
    </div>
  );
};

export default LoginError;
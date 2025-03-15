import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import LoginButton from './LoginButton';
import LoginError from './LoginError';
import { initGoogleAuth } from '../services/auth';

const LoginPage: React.FC = () => {
  const { error, loading } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // Google認証APIの初期化
    initGoogleAuth()
      .catch(err => console.error('Failed to initialize Google Auth:', err));
  }, []);

  if (error) {
    return <LoginError />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Google ToDo Client</h1>
        <p>Google ToDo リストをより便利に使えるクライアントアプリです。</p>
        {loading ? (
          <div className="loading">認証中...</div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
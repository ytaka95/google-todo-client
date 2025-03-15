// Google OAuth2認証関連の関数
// この実装は要件のログインだけを実現し、実際のGoogleタスクAPIとの連携は別途実装が必要

export const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google OAuth関連の処理用型定義
export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Google OAuth2クライアントの初期化
export const initGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Google APIのJSスクリプトを動的に読み込む
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google API load failed'));
    document.head.appendChild(script);
  });
};

// Google認証を開始する関数
export const signInWithGoogle = (): Promise<GoogleUserInfo> => {
  if (!window.google) {
    return Promise.reject(new Error('Google API not loaded'));
  }

  return new Promise((resolve, reject) => {
    // @ts-ignore - windowオブジェクトのgoogleプロパティは型定義されていないので無視
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      ux_mode: 'popup',
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        // 認証コードを取得したら、それをトークンと交換し、ユーザー情報を取得する
        // 注: 実際の実装では、認証コードをバックエンドに送信してトークンと交換するプロセスが必要
        // これはデモ用の簡略化された実装
        const mockUserInfo: GoogleUserInfo = {
          id: 'user123',
          email: 'user@example.com',
          name: 'テストユーザー',
          picture: 'https://ui-avatars.com/api/?name=テスト+ユーザー&background=random'
        };
        
        resolve(mockUserInfo);
      }
    });

    client.requestCode();
  });
};

// ログアウト処理
export const signOut = (): Promise<void> => {
  // ローカルストレージからトークンを削除するなどの処理
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_info');
  
  return Promise.resolve();
};
// Google OAuth2認証関連の関数
// Google Tasks APIと連携するための認証機能を提供

export const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// アクセストークンを保存するキー
const ACCESS_TOKEN_KEY = 'google_access_token';

// Google OAuth関連の処理用型定義
export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Google OAuth2クライアントとGAPIの初期化
export const initGoogleAuth = (): Promise<void> => {
  // 既にスクリプトが読み込まれている場合は再読み込みしない
  if (window.gapi && window.google && window.google.accounts) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      // すでにスクリプトが追加されているかチェック
      if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        if (window.gapi) {
          loadGsiScript();
        } else {
          // スクリプトはあるがまだ読み込まれていない場合
          setTimeout(() => {
            if (window.gapi) {
              loadGsiScript();
            } else {
              reject(new Error('GAPI script exists but failed to load'));
            }
          }, 1000);
        }
        return;
      }

      // GAPI（Google API）のJSスクリプトを動的に読み込む
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = () => {
        console.log('GAPI script loaded successfully');
        loadGsiScript();
      };
      gapiScript.onerror = () => {
        console.error('Failed to load GAPI script');
        reject(new Error('Google API load failed'));
      };
      document.head.appendChild(gapiScript);
    } catch (err) {
      console.error('Error in initGoogleAuth:', err);
      reject(err);
    }

    // GSI (Google Identity Services) スクリプトを読み込む関数
    function loadGsiScript() {
      // すでにGSIスクリプトが追加されているかチェック
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          // スクリプトはあるがまだ読み込まれていない場合
          setTimeout(() => {
            if (window.google && window.google.accounts) {
              resolve();
            } else {
              reject(new Error('GSI script exists but failed to load'));
            }
          }, 1000);
        }
        return;
      }

      // GSIスクリプトを読み込む
      window.gapi.load('client', () => {
        console.log('GAPI client loaded successfully');
        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.defer = true;
        gsiScript.onload = () => {
          console.log('GSI script loaded successfully');
          resolve();
        };
        gsiScript.onerror = () => {
          console.error('Failed to load GSI script');
          reject(new Error('Google Identity Services API load failed'));
        };
        document.head.appendChild(gsiScript);
      });
    }
  });
};

// GAPIクライアントの初期化
export const initGapiClient = async (): Promise<void> => {
  // すでにアクセストークンがある場合はGAPIクライアントを初期化
  const token = getAccessToken();
  if (!token) return;

  // gapi.clientが利用可能かチェック
  if (!window.gapi || !window.gapi.client) {
    // GAPIクライアントが読み込まれていない場合は、読み込む
    return new Promise((resolve, reject) => {
      if (!window.gapi) {
        reject(new Error('Google API (gapi) is not loaded. Please check if the script is included.'));
        return;
      }

      window.gapi.load('client', async () => {
        try {
          // タスクAPIの初期化
          await window.gapi.client.init({
            // APIキーは不要。アクセストークンを使用する
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest']
          });
          
          // アクセストークンを設定
          window.gapi.client.setToken({ access_token: token });
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  } else {
    // 既に読み込まれている場合は、そのままinitを呼び出す
    await window.gapi.client.init({
      // APIキーは不要。アクセストークンを使用する
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest']
    });
    
    // アクセストークンを設定
    window.gapi.client.setToken({ access_token: token });
  }
};

// 認証情報からユーザー情報を取得する関数
const fetchUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const userData = await response.json();
  return {
    id: userData.sub,
    email: userData.email,
    name: userData.name,
    picture: userData.picture
  };
};

// Google認証を開始する関数
export const signInWithGoogle = (): Promise<GoogleUserInfo> => {
  if (!window.google) {
    return Promise.reject(new Error('Google API not loaded'));
  }

  return new Promise((resolve, reject) => {
    try {
      // ステート値を生成（CSRF対策）
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem('oauth_state', state);

      // トークンフローを使用するOAuthクライアントを初期化
      // @ts-ignore - windowオブジェクトのgoogleプロパティは型定義されていないので無視
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        prompt: 'consent',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }

          // アクセストークンを保存
          localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);

          try {
            // ユーザー情報を取得
            const userInfo = await fetchUserInfo(tokenResponse.access_token);
            resolve(userInfo);
          } catch (error) {
            reject(error);
          }
        }
      });

      // 認証ダイアログを表示してトークンを取得
      tokenClient.requestAccessToken({ state });
    } catch (error) {
      reject(error);
    }
  });
};

// アクセストークンを取得
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// ログアウト処理
export const signOut = (): Promise<void> => {
  // ローカルストレージからトークンを削除する
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('user_info');
  localStorage.removeItem('oauth_state');
  
  // Google RevocationクライアントでOAuthトークンを明示的に無効化する場合
  // const token = getAccessToken();
  // if (token) {
  //   fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     }
  //   });
  // }
  
  return Promise.resolve();
};
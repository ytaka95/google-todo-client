# Google ToDo Client

Google Tasks APIを利用した、カスタムTODOリストアプリケーションです。標準のWebインターフェースよりも使いやすい機能を提供することを目指しています。

## 機能

- Googleアカウントを使ったログイン認証
- TODOの追加、編集、削除、完了操作
- TODOの一覧表示（タイトル、期限、詳細、完了状態）
- 詳細モーダル表示
- 期限日の相対表示（今日、明日など）
- ローカルストレージとの同期

## 技術スタック

- React 19
- TypeScript
- Vite
- Redux Toolkit
- Google OAuth 2.0

## 開発

### 前提条件

- Node.js 16以上
- npm 7以上
- Googleデベロッパーアカウント（OAuth 2.0クライアントIDの取得）

### 環境セットアップ

1. リポジトリをクローン:

```
git clone https://github.com/yourusername/google-todo-client.git
cd google-todo-client
```

2. 依存パッケージのインストール:

```
npm install
```

3. 環境変数の設定:

`.env.example`ファイルを`.env`にコピーし、Googleデベロッパーコンソールで取得したOAuth 2.0クライアントIDを設定します。

```
cp .env.example .env
```

`.env`ファイルを編集:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. 開発サーバーの起動:

```
npm run dev
```

5. ブラウザでアクセス:

```
http://localhost:5173/
```

## ビルド

プロダクション用ビルドを作成するには:

```
npm run build
```

ビルド結果は`dist`ディレクトリに出力されます。

## デプロイ

このアプリケーションはCloudflare Pagesにデプロイすることを想定しています。GitHubリポジトリと連携することで、自動デプロイが可能です。

## ライセンス

MIT

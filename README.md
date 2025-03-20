# Google ToDo Client

Google Tasks APIを利用した、カスタムTODOリストアプリケーション。

## 背景

生成AIを使ってどこまでできるのかを検証するために作成した。
初期構築時に利用した要件は [requirements.md](requirements.md)。

基本的に [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) を利用。ただし細かいエラーが解消できないときは他のサービスも利用し自分でもコード修正している。

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

3. 開発サーバーの起動:

```
npm run dev
```

4. ブラウザでアクセス:

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

このアプリケーションはCloudflare Pagesにデプロイしています。GitHubリポジトリと連携することで、自動デプロイが可能です。

https://tasks.ytkd.jp/

## ライセンス

MIT

# プロジェクト概要

## プロジェクト名
oidc-next-example

## 目的
OpenID Connect (OIDC) とiron-sessionを使用したNext.jsマルチテナント認証アプリケーションの実装例。

## 主な機能
- マルチテナント対応のOIDC認証（AWS Cognito使用）
- テナントごとの認証設定
- セッション管理（Prisma + SQLiteベース）
- 認証状態の一時保存（PKCE対応）
- ログイン/ログアウト機能
- 認証済みユーザー専用ページ（Home、Profile）

## プロジェクトの特徴
- Next.js 16（App Router）を使用
- TypeScriptで型安全性を確保
- Prismaを使用したデータベース管理
- Biomeを使用したコードフォーマット・Lint
- TailwindCSS v4でスタイリング
- React Compiler有効化

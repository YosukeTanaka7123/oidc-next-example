# 技術スタック

## フレームワーク・ライブラリ
- **Next.js**: 16.0.3（App Router、React Compiler有効）
- **React**: 19.2.0
- **React DOM**: 19.2.0
- **TypeScript**: 5.x

## 認証・セッション管理
- **openid-client**: 6.8.1（OIDC認証）
- **Prisma Client**: 6.19.0（データベース操作）

## データベース
- **SQLite**（Prisma経由）
- マイグレーション管理: Prisma Migrate

## スタイリング
- **TailwindCSS**: 4.x
- **PostCSS**: @tailwindcss/postcss 4.x

## 開発ツール
- **Biome**: 2.3.5（フォーマッター・リンター）
- **Prisma**: 6.19.0（スキーマ管理、マイグレーション）
- **babel-plugin-react-compiler**: 1.0.0

## 外部サービス
- **AWS Cognito**（OIDC Provider）
  - マルチテナント対応（Tenant A、Tenant B）
  - User Pool、App Client使用

## Node.jsバージョン
- 対象ブラウザ/環境: ES2017以降

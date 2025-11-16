# コードベース構造

## ディレクトリ構成

```
/Users/394586_black/myspace/oidc-next-example/
├── .serena/              # Serenaプロジェクト設定
├── prisma/               # Prismaスキーマとマイグレーション
│   ├── schema.prisma     # データベーススキーマ定義
│   └── migrations/       # マイグレーションファイル
├── public/               # 静的ファイル
├── src/                  # ソースコード
│   ├── app/              # Next.js App Router
│   │   ├── [tenant]/     # テナント別ルーティング
│   │   │   ├── (authenticated)/  # 認証済みユーザー専用
│   │   │   │   ├── home/         # ホームページ
│   │   │   │   └── profile/      # プロフィールページ
│   │   │   └── api/      # APIルート
│   │   │       └── auth/ # 認証関連API
│   │   │           ├── login/    # ログインエンドポイント
│   │   │           ├── callback/ # OIDCコールバック
│   │   │           └── logout/   # ログアウト
│   │   ├── layout.tsx    # ルートレイアウト
│   │   ├── page.tsx      # ルートページ
│   │   └── globals.css   # グローバルスタイル
│   ├── lib/              # ユーティリティ・ライブラリ
│   │   ├── auth/         # 認証ロジック
│   │   │   ├── config.ts   # Cognito設定
│   │   │   ├── cognito.ts  # Cognito OIDC client
│   │   │   ├── session.ts  # セッション管理
│   │   │   └── types.ts    # 型定義
│   │   └── prisma.ts     # Prismaクライアント
│   ├── types/            # 型定義
│   │   └── page.d.ts     # ページ型
│   └── proxy.ts          # プロキシ設定（HTTP Agentなど）
├── .env                  # 環境変数（gitignored）
├── .env.local            # ローカル環境変数（gitignored）
├── .env.local.example    # 環境変数テンプレート
├── biome.json            # Biome設定
├── tsconfig.json         # TypeScript設定
├── next.config.ts        # Next.js設定
├── postcss.config.mjs    # PostCSS設定
├── package.json          # npm設定
└── pnpm-lock.yaml        # pnpm lockfile
```

## 主要ファイル・モジュールの説明

### 認証フロー関連
- **src/lib/auth/config.ts**: テナント別Cognito設定管理
- **src/lib/auth/cognito.ts**: OIDC client初期化
- **src/lib/auth/session.ts**: セッション・認証状態の管理
- **src/lib/auth/types.ts**: 認証関連の型定義

### APIルート
- **src/app/[tenant]/api/auth/login/route.ts**: ログインフロー開始
- **src/app/[tenant]/api/auth/callback/route.ts**: OIDC認証コールバック処理
- **src/app/[tenant]/api/auth/logout/route.ts**: ログアウト処理

### ページコンポーネント
- **src/app/[tenant]/(authenticated)/home/page.tsx**: 認証済みホームページ
- **src/app/[tenant]/(authenticated)/profile/page.tsx**: プロフィールページ

### データベース
- **prisma/schema.prisma**: 2つのモデル定義
  - `AuthState`: OIDC認証フロー一時データ（PKCE用）
  - `Session`: ユーザーセッション管理

### その他
- **src/lib/prisma.ts**: Prismaクライアントのシングルトン
- **src/proxy.ts**: HTTPプロキシ設定（開発用）

## マルチテナント設計
- URLパス: `/{tenant}/...`形式
- 各テナントごとに異なるCognito設定
- セッションはテナント+emailでユニーク

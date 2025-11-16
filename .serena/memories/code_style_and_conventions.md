# コードスタイルと規約

## フォーマッター・リンター
- **Biome**を使用（ESLint + Prettierの代替）
- 設定ファイル: `biome.json`

## フォーマット規則
- **インデントスタイル**: スペース
- **インデント幅**: 2
- **インポートの自動整理**: 有効

## リンティング
- **ルール**: recommended
- **Next.js専用ルール**: 有効
- **React専用ルール**: 有効
- **例外**: `noUnknownAtRules`はオフ（Tailwindディレクティブ対応）

## TypeScript設定
- **strict mode**: 有効
- **target**: ES2017
- **jsx**: react-jsx（React 17+の新しいJSX変換）
- **moduleResolution**: bundler
- **パスエイリアス**: `@/*` → `./src/*`

## CSS
- **TailwindCSS v4**使用
- Tailwindディレクティブのパース有効

## コーディング規約
### ファイル構造
- App Routerパターン使用
- ページコンポーネントは`default export`
- Server Componentsがデフォルト

### 命名規則
- **コンポーネント**: PascalCase（例: `HomePage`）
- **関数**: camelCase（例: `getCurrentUser`）
- **定数**: UPPER_SNAKE_CASE（例: `SESSION_COOKIE_NAME`）
- **型/インターフェース**: PascalCase（例: `HomePageProps`）

### TypeScript型定義
- propsの型は明示的に定義
- `type`を優先（`interface`より）
- async関数のpropsは`Promise`型を使用（例: `params: Promise<{ tenant: string }>`）

### Reactパターン
- Server Components優先
- `async/await`でデータフェッチ
- `use client`は必要な時のみ使用

### インポート
- Next.js組み込みモジュール優先（例: `next/link`）
- パスエイリアス`@/`を使用
- 外部ライブラリ → 内部モジュールの順

## Git
- VCS: Git
- `.gitignore`でnode_modules、.next、.env等を除外
- Biomeの`vcs.useIgnoreFile`有効

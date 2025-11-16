# タスク完了時のチェックリスト

## コード変更後に必ず実行

### 1. コードフォーマット・Lint
```bash
pnpm check
```
または
```bash
npm run check
```
- Biomeによる自動フォーマットと自動修正
- エラーがないことを確認

### 2. TypeScript型チェック
```bash
npx tsc --noEmit
```
- 型エラーがないことを確認
- `strict: true`設定なので厳密にチェックされる

### 3. ビルド確認
```bash
pnpm build
```
- ビルドが成功することを確認
- 警告にも注意

## データベーススキーマ変更時

### 1. マイグレーション作成
```bash
npx prisma migrate dev --name <変更内容の説明>
```

### 2. Prismaクライアント再生成
```bash
npx prisma generate
```
- マイグレーションで自動実行されるが、念のため確認

## 新しい依存関係追加時

### 1. インストール確認
```bash
pnpm install
```

### 2. lockfileの更新確認
- `pnpm-lock.yaml`が更新されていることを確認
- コミットに含める

## 環境変数変更時

### 1. `.env.local.example`の更新
- 新しい環境変数を追加した場合は例も更新

### 2. ドキュメント更新
- READMEや関連ドキュメントに環境変数の説明を追加

## Git コミット前

### 1. 変更内容の確認
```bash
git status
git diff
```

### 2. 不要なファイルが含まれていないか確認
- `.env`ファイルなど秘密情報が含まれていないこと
- `node_modules`、`.next`などが含まれていないこと（.gitignoreで除外済み）

### 3. コミットメッセージ
- 明確で簡潔な説明
- 日本語または英語で統一

## 推奨される確認順序
1. `pnpm check`（フォーマット・Lint）
2. `npx tsc --noEmit`（型チェック）
3. `pnpm build`（ビルド確認）
4. 開発サーバーで動作確認（`pnpm dev`）
5. 必要に応じてPrisma関連コマンド実行
6. Git操作（add、commit、push）

## 注意事項
- テストは現在未実装（必要に応じて追加を検討）
- React Compiler有効化により、React HooksルールにはReactコンパイラが対応
- Server Componentsがデフォルトのため、クライアントコンポーネントは明示的に`use client`を付ける

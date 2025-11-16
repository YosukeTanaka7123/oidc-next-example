# 推奨コマンド

## 開発サーバー起動
```bash
pnpm dev
# または
npm run dev
```
デフォルトポート: http://localhost:3000

## ビルド
```bash
pnpm build
# または
npm run build
```

## 本番サーバー起動
```bash
pnpm start
# または
npm run start
```

## コードチェック（フォーマット・Lint）
```bash
pnpm check
# または
npm run check
```
- Biomeによるフォーマットとリンティングを自動修正付きで実行
- `--write`オプション付きなので変更が自動適用される

## Prisma関連コマンド

### マイグレーション作成・適用
```bash
npx prisma migrate dev --name <migration_name>
```

### Prismaクライアント生成
```bash
npx prisma generate
```

### データベースリセット
```bash
npx prisma migrate reset
```

### Prisma Studio起動（データベースGUI）
```bash
npx prisma studio
```

## 依存関係インストール
```bash
pnpm install
# または
npm install
```

## Git基本コマンド（Darwin環境）
```bash
# 状態確認
git status

# 変更をステージング
git add .

# コミット
git commit -m "commit message"

# プッシュ
git push

# ブランチ確認
git branch

# 差分確認
git diff
```

## その他のユーティリティコマンド（Darwin）
```bash
# ファイル・ディレクトリ一覧
ls -la

# ディレクトリ移動
cd <path>

# ファイル検索
find . -name "*.ts"

# テキスト検索
grep -r "search_term" ./src

# 現在のディレクトリパス表示
pwd
```

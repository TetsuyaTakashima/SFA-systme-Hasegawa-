# kabu_web_next

`kabu_web_next` は、既存の `kabu_web` を置き換えるための Next.js 版です。
旧版はそのまま残し、Vercel Root Directoryを切り替えるまで並行運用できます。

## 特徴

- 米国株/日本株の切替
- ウォッチリスト、会社名表示、銘柄マスター検索
- スクリーナー、注目候補、予想根拠
- デモトレード、少額モード、注文後現金の概算
- 初心者向け説明モード
- Supabase Magic Linkと `app_state` 同期
- サーバー側Route Handler経由の正式マーケットデータAPI

## 開発

```bash
npm install
npm run dev
```

検証:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## デプロイ

詳細は [DEPLOY.md](./DEPLOY.md) を参照してください。

# kabu_web_next デプロイガイド

## 目的

`kabu_web_next` は、既存の静的 `kabu_web` を壊さずに並行構築した Next.js 版です。
Vercel の Root Directory を `kabu_web_next` に切り替えると v2 を配信できます。

## 技術スタック

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Zustand
- Lightweight Charts
- Supabase Auth / Database

## 環境変数

Vercel Project Settings > Environment Variables に `.env.example` の値を登録してください。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MARKET_DATA_PROVIDER`
- `POLYGON_API_KEY`
- `ALPHA_VANTAGE_API_KEY`
- `ALLOWED_ORIGIN`

`SUPABASE_SERVICE_ROLE_KEY` はサーバー専用です。ブラウザ、Git、チャットには出さないでください。

## Supabase

1. Supabase Projectを作成
2. Authentication > ProvidersでEmailを有効化
3. Authentication > URL Configurationで本番URLとローカルURLをRedirect URLへ追加
4. SQL Editorで `supabase/schema.sql` を実行

v2は正規化テーブルを追加していますが、旧版互換の `app_state` も残しています。
初期リリースではローカル保存と `app_state` 同期を併用し、段階的に正規化テーブルへ移行します。

## ローカル確認

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
```

## Vercel

1. GitHubリポジトリをVercelにImport
2. Root Directory: `kabu_web_next`
3. Framework Preset: Next.js
4. Build Command: `npm run build`
5. Deploy

## 切替手順

1. `kabu_web_next` をPreview Deploymentで確認
2. ログインなし試用、Magic Link、ウォッチリスト、スクリーナー、デモ注文を確認
3. 問題なければVercel ProductionのRoot Directoryを `kabu_web_next` へ変更
4. 旧 `kabu_web` はロールバック用として残す

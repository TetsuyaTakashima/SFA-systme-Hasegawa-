# kabu_web デプロイ準備ガイド（Vercel + Supabase + GitHub）

## 現在の構成

```
kabu_web/
├── index.html
├── vercel.json
├── api/proxy.js
├── data/symbol-master.json
├── data/symbol-master.js
├── scripts/check-static.mjs
├── supabase/schema.sql
└── .env.example
```

## 1. GitHub

このリポジトリには `kabu_web` 専用のGitHub Actionsを追加しています。

- 対象: `kabu_web/**` と `.github/workflows/kabu-web-check.yml`
- 検査: `index.html` のインラインJS構文、銘柄マスターJSON、Vercel設定、Supabase RLS、APIプロキシの最低限チェック
- ローカル確認:

```bash
node kabu_web/scripts/check-static.mjs
```

## 2. Vercel

Vercelでは、このリポジトリ全体ではなく `kabu_web` をデプロイ対象にします。

1. VercelでGitHubリポジトリをImport
2. Project Settings > Build & Development Settings
3. Root Directory: `kabu_web`
4. Framework Preset: `Other`
5. Build Command / Output Directory: 空のまま
6. Deploy

`kabu_web/vercel.json` で以下を設定済みです。

- `/api/proxy` をVercel Functionとして利用
- 東京リージョン（`hnd1`）を優先
- `index.html` は `no-store`
- `data/` はCDNキャッシュ
- CSP、HSTS、X-Frame-Options、Referrer-Policy、Permissions-Policyなどの基本セキュリティヘッダ

## 3. Supabase

現時点では、アプリ本体は未ログインでも localStorage 保存で動きます。
Supabaseは「クラウド保存・ログイン同期」へ進めるためのスキーマと環境変数枠を準備済みです。

1. SupabaseでNew Projectを作成（リージョンはTokyo推奨）
2. SQL Editorで `kabu_web/supabase/schema.sql` を実行
3. Authentication > ProvidersでEmailを有効化
4. Vercel Project Settings > Environment Variables に `.env.example` の値を登録

重要:

- `SUPABASE_ANON_KEY` はRLS前提でブラウザ利用できる公開キーです。
- `SUPABASE_SERVICE_ROLE_KEY` はサーバー専用です。Git、ブラウザ、チャットに出さないでください。
- `schema.sql` は `drop policy if exists` を含め、再実行してもポリシー重複で止まりにくい形にしています。

## 4. 株価取得の注意

`api/proxy.js` はYahoo Financeの `query1.finance.yahoo.com` / `query2.finance.yahoo.com` だけを許可します。
HTTPS、GET、リダイレクト拒否、URL長制限を入れており、任意URLプロキシとして使われないようにしています。
また、デフォルトでは `Access-Control-Allow-Origin: *` を返しません。
別ドメインから `/api/proxy` を読む必要がある場合だけ、Vercel環境変数 `ALLOWED_ORIGIN` に許可するオリジンを1つ設定してください。

Yahoo Financeは非公式利用のため、仕様変更や利用制限のリスクがあります。
本番で長期運用する場合は、Polygon.io、Finnhub、Alpha Vantage、IEX Cloudなどの正式APIへの切替を検討してください。

## 5. 次の実装候補

優先度が高い順です。

1. Supabase AuthのログインUIを追加
2. watchlist / paper account / positions / history をlocalStorageからSupabaseへ同期
3. 長期株価キャッシュをSupabase Edge FunctionsまたはVercel Cronで定期更新
4. Chart.js CDNを自己ホストまたはSRI付き読み込みへ変更し、CSPから `unsafe-inline` を減らす
5. Yahoo非公式APIから正式マーケットデータAPIへ切替

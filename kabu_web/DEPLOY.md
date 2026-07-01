# kabu_web デプロイ準備ガイド（Vercel + Supabase + GitHub）

## 現在の構成

```
kabu_web/
├── index.html
├── vercel.json
├── api/config.js
├── api/market-data.js
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
- 検査: `index.html` のインラインJS構文、銘柄マスターJSON、Vercel設定、Supabase RLS、API関数、ネイティブダイアログ利用有無の最低限チェック
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

- `/api/config` で公開してよいランタイム設定だけを返す
- `/api/market-data` で正式マーケットデータAPIをサーバー側から呼ぶ
- `/api/proxy` をVercel Functionとして利用
- 東京リージョン（`hnd1`）を優先
- `index.html` は `no-store`
- `data/` はCDNキャッシュ
- CSP、HSTS、X-Frame-Options、Referrer-Policy、Permissions-Policyなどの基本セキュリティヘッダ

設定する環境変数:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ALLOWED_ORIGIN`（別オリジンから `/api/proxy` を読む場合のみ）
- `MARKET_DATA_PROVIDER`（`polygon` または `alpha_vantage`）
- `POLYGON_API_KEY` または `ALPHA_VANTAGE_API_KEY`

## 3. Supabase

アプリ本体は未ログインでも localStorage 保存で動きます。
Supabaseを設定すると、画面上部の「保存・同期」からMagic Linkログインを行い、ウォッチリストとデモ口座を `app_state` テーブルにクラウド同期できます。

1. SupabaseでNew Projectを作成（リージョンはTokyo推奨）
2. SQL Editorで `kabu_web/supabase/schema.sql` を実行
3. Authentication > ProvidersでEmailを有効化
4. Authentication > URL Configurationで、本番URLとローカル検証URLをRedirect URLに追加
5. Vercel Project Settings > Environment Variables に `.env.example` の値を登録
6. アプリ画面の「保存・同期」でメールアドレスを入力し、Magic Linkでログイン
7. 「ローカルをクラウド保存」または「クラウドから読み込み」で同期を確認

重要:

- `SUPABASE_ANON_KEY` はRLS前提でブラウザ利用できる公開キーです。
- `SUPABASE_SERVICE_ROLE_KEY` はサーバー専用です。Git、ブラウザ、チャットに出さないでください。
- `app_state` は `user_id + market + key` を主キーにし、RLSで本人のデータだけ読書きできます。
- `schema.sql` は `drop policy if exists` を含め、再実行してもポリシー重複で止まりにくい形にしています。

## 4. 株価取得の注意

`api/proxy.js` はYahoo Financeの `query1.finance.yahoo.com` / `query2.finance.yahoo.com` だけを許可します。
HTTPS、GET、リダイレクト拒否、URL長制限を入れており、任意URLプロキシとして使われないようにしています。
また、デフォルトでは `Access-Control-Allow-Origin: *` を返しません。
別ドメインから `/api/proxy` を読む必要がある場合だけ、Vercel環境変数 `ALLOWED_ORIGIN` に許可するオリジンを1つ設定してください。

Yahoo Financeは非公式利用のため、仕様変更や利用制限のリスクがあります。
本番で長期運用する場合は、正式APIの利用を推奨します。
このリポジトリでは、Vercel環境変数に以下を設定すると画面の株価ソースで「正式API」を選べます。

Polygon.ioを使う場合:

```bash
MARKET_DATA_PROVIDER=polygon
POLYGON_API_KEY=...
```

Alpha Vantageを使う場合:

```bash
MARKET_DATA_PROVIDER=alpha_vantage
ALPHA_VANTAGE_API_KEY=...
```

注意:

- APIキーはVercel Function内だけで使い、ブラウザには返しません。
- Polygon設定は現状、米国株向けです。日本株を正式APIで扱う場合はAlpha Vantage等、日本株コードに対応したプロバイダーを使ってください。
- 無料プランはレート制限が厳しいため、データ更新範囲は「高速」または「表示中だけ」から始めるのがおすすめです。

## 5. 次の実装候補

優先度が高い順です。

1. 長期株価キャッシュをSupabase Edge FunctionsまたはVercel Cronで定期更新
2. `watchlist` / `paper_accounts` などの正規化テーブルへ、`app_state` から段階的に移行
3. Chart.jsとSupabase JSを自己ホストまたはSRI付き読み込みへ変更し、CSPから `unsafe-inline` を減らす
4. 正式APIのプロバイダーを増やし、日本株のリアルタイム性と板寄せ時間の扱いを改善
5. ログイン後の端末間競合解決（どちらの更新が新しいかの差分表示）を追加

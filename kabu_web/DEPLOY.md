# kabu_system Web化ガイド（Vercel + Supabase）

## このフォルダの構成

```
kabu_web/
├── index.html          # ダッシュボード本体（Web対応済み）
├── api/
│   └── proxy.js        # Yahoo Finance APIプロキシ（Vercel Function）
├── supabase/
│   └── schema.sql      # Supabaseのテーブル定義（RLS設定済み）
└── DEPLOY.md           # このファイル
```

## Web化で何が良くなるか（正直な整理）

**良くなること**
- ✅ CORSプロキシ不要になり株価取得が安定・高速化（`/api/proxy` が60秒CDNキャッシュ付きで応答）
- ✅ スマホ含むどの端末からも同じURLでアクセス可能
- ✅ Supabase導入後はデータがクラウド保存され、端末をまたいで同期（ブラウザのデータ削除でも消えない）
- ✅ 将来的にSupabase Edge Functions + cron で「画面を開いていなくても」価格記録やアラートが可能

**変わらないこと（注意）**
- ⚠ 株価データの鮮度はデータソース次第。Yahoo非公式APIは取引時間中ほぼリアルタイム〜数分遅延。
  ティックレベルの本物のリアルタイムが必要なら有料API（Polygon.io等）への切替が必要
- ⚠ Yahoo非公式APIは仕様変更リスクあり（その場合proxy.jsの修正で対応）

## デプロイ手順

### Step 1: Vercel（まずこれだけで動きます）

1. このkabu_webフォルダの中身をGitHubの `kabu_system` リポジトリに入れる
   （index.html と api/ がリポジトリ直下に来るように）
2. https://vercel.com → "Add New Project" → GitHubの `kabu_system` をImport
3. Framework Preset: **Other**、設定はデフォルトのまま Deploy
4. 発行されたURL（例: `https://kabu-system.vercel.app`）を開く

→ この時点で「株価取得がプロキシ経由で安定する」「どこからでも見られる」が実現します。
データ保存はまだ各ブラウザ内（localStorage）です。

### Step 2: Supabase（クラウド保存・同期）

1. https://supabase.com → New Project（リージョンは Tokyo 推奨）
2. SQL Editor に `supabase/schema.sql` の中身を貼り付けて Run
3. Authentication → Providers → Email を有効化（Magic Link推奨）
4. Project Settings → API から以下2つを控える:
   - Project URL（例: `https://xxxx.supabase.co`）
   - anon public key
5. index.html へのSupabase組み込み（次の実装フェーズ）:
   - `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` を読み込み
   - ログインUI（メールアドレス入力 → Magic Link）
   - localStorage読み書き箇所（saveStocks/savePaper等）をSupabase upsertに置換
   - 起動時にSupabaseから読み込み、未ログイン時はlocalStorageにフォールバック

※ Step 2の組み込みコードは量があるため、Supabaseプロジェクト作成後に
   URL とanon keyが決まった段階で依頼してもらえれば実装します。
   （anon keyは公開前提のキーなのでチャットで共有しても問題ありません。
    service_role keyは絶対に共有・コミットしないでください）

## セキュリティメモ

- `api/proxy.js` はYahoo Financeのホストのみ許可（SSRF対策済み）
- 全テーブルにRLS設定済み: ログインユーザーは自分の行しか読み書きできません
- リポジトリが公開の場合も、anon keyはRLS前提で公開可能な設計です

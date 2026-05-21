# Webデプロイ設計

このアプリは現在、静的HTML/CSS/JavaScriptと `localStorage` で動くプロトタイプです。本番化するときは、画面の操作感を保ったままデータ層と認証をSupabaseへ差し替える設計にします。

## 推奨構成

- フロントエンド: Vercelでホスティング
- リポジトリ: GitHubで管理し、mainブランチへのマージでVercelへ自動デプロイ
- 認証: Supabase Auth
- DB: Supabase Postgres
- 権限: Supabase Row Level Security
- CSV取り込み: フロントでプレビュー、確定時にSupabaseへupsert
- ログイン: `login.html` はSupabase Authへ接続済み。ログインIDは内部的に `ログインID@crm.local` のメール形式へ変換
- ユーザー作成: 管理者ログイン後の管理画面から、Vercel Functions の `/api/create-user` 経由でSupabase Authユーザーと `profiles` を作成
- 自動保存: 入力変更ごとにSupabaseへ保存し、保存中・保存済み・失敗の状態を画面に表示
- 同時編集対策: `updated_at` と `lock_version` を使った楽観ロック、Supabase Realtimeで他ユーザー更新を即時反映
- 個人設定: 列順、固定列、表示列、通知日数、通知対象、通知解除条件はユーザーごとの設定テーブルへ保存
- 通知: 開発版はブラウザ通知。本番は施設別の通知日数を参照し、Supabase Edge Functionsの定期実行でメールまたはWeb Pushへ拡張
- マスタ設定: 状態と温度感は管理者だけが編集できるマスタテーブルとして保存
- AI架電支援: 本番ではEdge Functionsでスクリプト生成、文字起こし、録音分析を非同期実行

## データモデル

- `profiles`: Supabase Authユーザーに紐づくスタッフ情報、ログインID、権限
- `venue_status_options`: 管理者が編集できる状態マスタ（名称、表示色、架電対象外）
- `venue_temperature_options`: 管理者が編集できる温度感マスタ（A〜Eの表示名、表示色）
- `venues`: 営業先施設
- `call_histories`: 架電・入力変更の履歴
- `call_reminders`: 架電通知の送信履歴
- `user_preferences`: 列順、固定列、表示列、通知設定などのユーザー別設定
- AI/録音分析を追加する場合は `call_scripts`、`call_recordings`、`call_ai_reviews` を追加

初期SQL案は `docs/supabase-schema.sql` にあります。

## 権限設計

- 管理: ユーザー追加、権限変更、施設削除、全施設の編集
- スタッフ: 施設の閲覧、追加、編集、CSV取り込み、CSV書き出し
- 状態・温度感マスタ編集: 管理ユーザーのみ

本番では `profiles.role` を `admin` / `staff` で持ち、RLSで削除やユーザー管理を制限します。

## 保存と同時編集

- 各セル変更時に、該当フィールドだけをSupabaseへ `update` します。
- テキスト入力は短い待ち時間で自動保存し、日付やプルダウンは変更直後に保存します。
- 保存失敗時は画面に残したまま再試行できるようにし、必要に応じて一時的にブラウザ側にも下書きを保持します。
- 更新時は `id` と `lock_version` を条件にし、保存成功時に `lock_version` を増やします。
- 他ユーザーが先に更新していた場合は、上書きせず差分を検知して、最新値を取り込むか自分の入力で上書きするか選べる設計にします。
- Supabase Realtimeで他ユーザーの変更を受け取り、一覧画面へ即時反映します。

## 実装移行順

1. 現在の静的版をGitHubへpush
2. Vercelで静的サイトとして公開
3. Supabaseプロジェクトを作成
4. `docs/supabase-schema.sql` を適用
5. `login.html` の認証処理をSupabase Authへ差し替え
6. `localStorage` の読み書きをSupabase APIへ差し替え
7. CSV取り込みを `venues` へのupsertへ変更
8. 通知をEdge Functionsの定期実行へ移行
9. 状態マスタを `venue_status_options`、温度感マスタを `venue_temperature_options` へ移行
10. Realtimeと楽観ロックで同時編集対策を追加
11. 必要に応じてAI架電支援と録音分析を追加

## 公式ドキュメント

- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

## 現在の実装で必要な追加設定

- 既に `docs/supabase-schema.sql` を適用済みの場合は、Supabase SQL Editorで `docs/supabase-after-setup.sql` を実行します。
- 初期管理者のAuthメールは `admin@crm.local`、`profiles.login_id` は `admin` にします。
- `admin / password` でログインできない場合は、Supabase SQL Editorで `docs/supabase-admin-check.sql` を実行し、Authユーザーと `profiles` のidが一致しているか確認します。
- Vercelの環境変数に `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定します。`SUPABASE_SERVICE_ROLE_KEY` はユーザー作成APIだけで使う秘密鍵なので、フロント側のファイルには書きません。
- 必要に応じて `SUPABASE_ANON_KEY` または `SUPABASE_PUBLISHABLE_KEY`、`AUTH_EMAIL_DOMAIN=crm.local` もVercel環境変数へ追加します。
- Vercel Git連携: https://vercel.com/docs/deployments/git
- Vercel設定ファイル: https://vercel.com/docs/project-configuration
- GitHub Actions Secrets: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions

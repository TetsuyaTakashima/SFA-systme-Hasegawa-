-- kabu_system Supabaseスキーマ
-- SupabaseダッシュボードのSQL Editorに貼り付けて実行してください。
-- すべてのテーブルにRLS（行レベルセキュリティ）を設定済み: 自分のデータしか読み書きできません。

-- ウォッチリスト / 保有株
create table if not exists watchlist (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sym text not null,
  sector text not null default 'その他',
  shares numeric,          -- null = ウォッチのみ
  cost numeric,            -- 取得単価$
  created_at timestamptz not null default now(),
  unique (user_id, sym)
);

-- デモトレード口座（1ユーザー1行）
create table if not exists paper_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cash numeric not null default 10000,
  initial numeric not null default 10000,
  mode text not null default 'simple' check (mode in ('simple','pro')),
  fee_rate numeric not null default 0.1,
  leverage numeric not null default 1,
  allow_short boolean not null default false,
  realized numeric not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  rules jsonb not null default '{"maxPosPct":20,"minCashPct":10,"stopLossPct":8}',
  updated_at timestamptz not null default now()
);

-- デモトレード保有ポジション（qtyは符号付き: ＋ロング / −ショート）
create table if not exists paper_positions (
  user_id uuid not null references auth.users(id) on delete cascade,
  sym text not null,
  qty numeric not null,
  avg numeric not null,
  primary key (user_id, sym)
);

-- 未約定注文（指値・逆指値・逆指値付指値）
create table if not exists paper_orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sym text not null,
  side text not null check (side in ('buy','sell')),
  type text not null check (type in ('limit','stop','stoplimit')),
  qty numeric not null,
  limit_price numeric,
  stop_price numeric,
  tif text not null default 'gtc' check (tif in ('gtc','day')),
  note text,
  created_at timestamptz not null default now()
);

-- 取引履歴
create table if not exists paper_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  side text not null,            -- 買 / 売 / 失効
  sym text not null,
  qty numeric not null,
  price numeric not null,
  fee numeric not null default 0,
  realized numeric,              -- 売却時の実現損益
  note text,
  executed_at timestamptz not null default now()
);

-- 資産推移（1日1行）＋同日のS&P500終値
create table if not exists equity_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  d date not null,
  total numeric not null,
  spx numeric,
  primary key (user_id, d)
);

-- 長期株価キャッシュ（全ユーザー共有・書き込みはサービスロールのみ）
create table if not exists long_data (
  sym text primary key,
  data jsonb not null,           -- {ts:[...], c:[...]}
  updated_at timestamptz not null default now()
);

-- ===== RLS =====
alter table watchlist enable row level security;
alter table paper_accounts enable row level security;
alter table paper_positions enable row level security;
alter table paper_orders enable row level security;
alter table paper_history enable row level security;
alter table equity_history enable row level security;
alter table long_data enable row level security;

create policy "own watchlist" on watchlist for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own account" on paper_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own positions" on paper_positions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own orders" on paper_orders for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own history" on paper_history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own equity" on equity_history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "read shared long_data" on long_data for select
  using (true);  -- 読み取りは全認証ユーザー可、書き込みはservice roleのみ（ポリシー無し）

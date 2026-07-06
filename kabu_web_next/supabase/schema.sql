-- kabu_web v2 Supabase schema
-- Run in Supabase SQL Editor. All user-owned tables use RLS.

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_market text not null default 'us' check (active_market in ('us','jp')),
  beginner_mode boolean not null default false,
  small_amount_mode boolean not null default false,
  layout jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists watchlist (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  market text not null check (market in ('us','jp')),
  symbol text not null,
  name text not null default '',
  sector text not null default 'その他',
  shares numeric,
  average_cost numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, market, symbol)
);

create table if not exists demo_accounts (
  user_id uuid not null references auth.users(id) on delete cascade,
  market text not null check (market in ('us','jp')),
  cash numeric not null default 1000000,
  initial_cash numeric not null default 1000000,
  rules jsonb not null default '{"maxPositionPct":20,"minCashPct":10,"stopLossPct":8}',
  updated_at timestamptz not null default now(),
  primary key (user_id, market)
);

create table if not exists demo_positions (
  user_id uuid not null references auth.users(id) on delete cascade,
  market text not null check (market in ('us','jp')),
  symbol text not null,
  name text not null default '',
  quantity numeric not null,
  average_cost numeric not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, market, symbol)
);

create table if not exists demo_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  market text not null check (market in ('us','jp')),
  symbol text not null,
  side text not null check (side in ('buy','sell')),
  quantity numeric not null,
  price numeric not null,
  amount numeric not null,
  fee numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists market_cache (
  symbol text not null,
  market text not null check (market in ('us','jp')),
  range_key text not null,
  source text not null,
  bars jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (symbol, market, range_key)
);

-- v1 compatibility table for migration and quick cloud sync.
create table if not exists app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  market text not null check (market in ('us','jp')),
  key text not null check (key in ('stocks','paper','settings')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, market, key)
);

alter table user_settings enable row level security;
alter table watchlist enable row level security;
alter table demo_accounts enable row level security;
alter table demo_positions enable row level security;
alter table demo_orders enable row level security;
alter table market_cache enable row level security;
alter table app_state enable row level security;

drop policy if exists "own user_settings" on user_settings;
drop policy if exists "own watchlist" on watchlist;
drop policy if exists "own demo_accounts" on demo_accounts;
drop policy if exists "own demo_positions" on demo_positions;
drop policy if exists "own demo_orders" on demo_orders;
drop policy if exists "read market_cache" on market_cache;
drop policy if exists "own app_state" on app_state;

create policy "own user_settings" on user_settings for all
  to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own watchlist" on watchlist for all
  to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own demo_accounts" on demo_accounts for all
  to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own demo_positions" on demo_positions for all
  to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own demo_orders" on demo_orders for all
  to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "read market_cache" on market_cache for select
  to authenticated
  using (true);

create policy "own app_state" on app_state for all
  to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

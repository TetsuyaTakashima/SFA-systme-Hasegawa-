-- Configurable sales target types and indexed cross-field search.

create extension if not exists pg_trgm with schema extensions;

create table if not exists public.sales_target_types (
  key text primary key check (key ~ '^[a-z0-9_-]+$'),
  label text not null unique check (length(btrim(label)) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.sales_target_types (key, label, sort_order, active)
values ('facility', '施設', 1, true), ('school', '学校', 2, true)
on conflict (key) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    active = true,
    updated_at = now();

alter table public.sales_target_types enable row level security;

drop policy if exists "target types readable by active users" on public.sales_target_types;
create policy "target types readable by active users"
  on public.sales_target_types for select to authenticated
  using ((select private.is_active_user()));

drop policy if exists "target types insertable by admins" on public.sales_target_types;
create policy "target types insertable by admins"
  on public.sales_target_types for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists "target types updatable by admins" on public.sales_target_types;
create policy "target types updatable by admins"
  on public.sales_target_types for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "target types deletable by admins" on public.sales_target_types;
create policy "target types deletable by admins"
  on public.sales_target_types for delete to authenticated
  using ((select private.is_admin()));

grant select, insert, update, delete on public.sales_target_types to authenticated;

alter table public.venues drop constraint if exists venues_record_type_check;
alter table public.venues drop constraint if exists venues_record_type_fkey;
alter table public.venues
  add constraint venues_record_type_fkey
  foreign key (record_type) references public.sales_target_types(key)
  on update cascade;

alter table public.venues
  add column if not exists search_text text generated always as (
    coalesce(facility_name, '') || ' ' || coalesce(category, '') || ' ' ||
    coalesce(operator, '') || ' ' || coalesce(prefecture, '') || ' ' ||
    coalesce(municipality, '') || ' ' || coalesce(address, '') || ' ' ||
    coalesce(phone, '') || ' ' || coalesce(fax, '') || ' ' ||
    coalesce(email, '') || ' ' || coalesce(department, '') || ' ' ||
    coalesce(contact_name, '') || ' ' || coalesce(main_hall_name, '') || ' ' ||
    coalesce(genres, '') || ' ' || coalesce(status, '') || ' ' ||
    coalesce(next_action, '') || ' ' || coalesce(notes, '')
  ) stored;

create index if not exists venues_search_text_trgm_idx
  on public.venues using gin (search_text extensions.gin_trgm_ops)
  where is_hidden = false;

create index if not exists venues_visible_type_status_next_action_idx
  on public.venues (record_type, status, next_action_date, id)
  where is_hidden = false;

create or replace function public.sales_target_import_coverage()
returns table (prefecture text, record_type text, target_count bigint)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select v.prefecture, v.record_type, count(*)
  from public.venues v
  where not v.is_hidden and v.prefecture is not null
  group by v.prefecture, v.record_type
  order by v.prefecture, v.record_type;
$$;

revoke all on function public.sales_target_import_coverage() from public, anon;
grant execute on function public.sales_target_import_coverage() to authenticated;

analyze public.venues;

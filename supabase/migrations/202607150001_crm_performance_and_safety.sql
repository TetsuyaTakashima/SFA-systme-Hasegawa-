-- CRM list performance, durable record types, audit history, and RLS repair.

alter table public.venues
  add column if not exists record_type text not null default 'facility'
  check (record_type in ('facility', 'school'));

update public.venues
set record_type = 'school'
where record_type = 'facility'
  and concat_ws(' ', category, facility_name, notes) ~* '(学校|高校|高等|中学|小学|大学|短大|高専|幼稚園|こども園|専修|各種学校|義務教育|特別支援)';

create index if not exists venues_visible_record_type_prefecture_idx
  on public.venues (record_type, prefecture, facility_name)
  where is_hidden = false;
create index if not exists venues_visible_status_idx
  on public.venues (status, next_action_date)
  where is_hidden = false;
create index if not exists venues_visible_assignee_next_action_idx
  on public.venues (assigned_user_id, next_action_date)
  where is_hidden = false;
create index if not exists venues_updated_at_idx on public.venues (updated_at desc);
create index if not exists venues_assigned_user_id_idx on public.venues (assigned_user_id);
create index if not exists venues_call_updated_by_user_id_idx on public.venues (call_updated_by_user_id);
create index if not exists venues_created_by_idx on public.venues (created_by);
create index if not exists venues_updated_by_idx on public.venues (updated_by);
create index if not exists call_histories_venue_id_idx on public.call_histories (venue_id);
create index if not exists call_histories_changed_by_user_id_idx on public.call_histories (changed_by_user_id);
create index if not exists call_reminders_user_id_idx on public.call_reminders (user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and active = true
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

alter table public.user_preferences enable row level security;
drop policy if exists "users manage own preferences" on public.user_preferences;
create policy "users manage own preferences"
  on public.user_preferences
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter table public.call_reminders enable row level security;
drop policy if exists "users manage own reminders" on public.call_reminders;
create policy "users manage own reminders"
  on public.call_reminders
  for all
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('venues', 'profiles')),
  entity_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  changed_fields text[] not null default '{}'::text[],
  before_data jsonb,
  after_data jsonb,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_created_at_idx on public.audit_events (created_at desc);
create index if not exists audit_events_entity_idx on public.audit_events (entity_type, entity_id, created_at desc);
create index if not exists audit_events_actor_id_idx on public.audit_events (actor_id, created_at desc);

alter table public.audit_events enable row level security;
drop policy if exists "admins read audit events" on public.audit_events;
create policy "admins read audit events"
  on public.audit_events
  for select
  to authenticated
  using (public.is_admin());
grant select on public.audit_events to authenticated;

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  before_json jsonb;
  after_json jsonb;
  changed text[];
  ignored_fields text[] := array['created_at', 'updated_at', 'created_by', 'updated_by', 'lock_version', 'call_updated_at', 'call_updated_by_user_id'];
  actor uuid;
begin
  if tg_op = 'INSERT' then
    after_json := to_jsonb(new);
    insert into public.audit_events (entity_type, entity_id, action, changed_fields, after_data, actor_id)
    values (
      tg_table_name,
      new.id,
      'insert',
      array[]::text[],
      after_json,
      coalesce((select auth.uid()), nullif(after_json ->> 'created_by', '')::uuid, nullif(after_json ->> 'updated_by', '')::uuid)
    );
    return new;
  end if;

  if tg_op = 'DELETE' then
    before_json := to_jsonb(old);
    insert into public.audit_events (entity_type, entity_id, action, changed_fields, before_data, actor_id)
    values (
      tg_table_name,
      old.id,
      'delete',
      array[]::text[],
      before_json,
      coalesce((select auth.uid()), nullif(before_json ->> 'updated_by', '')::uuid, nullif(before_json ->> 'created_by', '')::uuid)
    );
    return old;
  end if;

  before_json := to_jsonb(old);
  after_json := to_jsonb(new);
  select coalesce(array_agg(item.key order by item.key), array[]::text[])
    into changed
  from jsonb_each(after_json) as item(key, value)
  where (before_json -> item.key) is distinct from item.value
    and not (item.key = any (ignored_fields));

  if cardinality(changed) = 0 then
    return new;
  end if;

  actor := coalesce((select auth.uid()), nullif(after_json ->> 'updated_by', '')::uuid, nullif(after_json ->> 'created_by', '')::uuid);
  insert into public.audit_events (entity_type, entity_id, action, changed_fields, before_data, after_data, actor_id)
  values (tg_table_name, new.id, 'update', changed, before_json, after_json, actor);
  return new;
end;
$$;

revoke all on function public.audit_row_change() from public, anon, authenticated;

drop trigger if exists venues_audit_change on public.venues;
create trigger venues_audit_change
  after insert or update or delete on public.venues
  for each row execute function public.audit_row_change();

drop trigger if exists profiles_audit_change on public.profiles;
create trigger profiles_audit_change
  after update on public.profiles
  for each row execute function public.audit_row_change();

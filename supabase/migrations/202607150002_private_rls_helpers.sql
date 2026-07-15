-- Keep the admin-check function out of the exposed API schema and cache it in RLS plans.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
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

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;

drop policy if exists "admins read audit events" on public.audit_events;
create policy "admins read audit events"
  on public.audit_events for select to authenticated
  using ((select private.is_admin()));

drop policy if exists "call histories readable by admins" on public.call_histories;
create policy "call histories readable by admins"
  on public.call_histories for select to authenticated
  using ((select private.is_admin()));

drop policy if exists "call histories writable by signed in users" on public.call_histories;
create policy "call histories writable by signed in users"
  on public.call_histories for insert to authenticated
  with check (changed_by_user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "users manage own reminders" on public.call_reminders;
create policy "users manage own reminders"
  on public.call_reminders for all to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "profiles manageable by admins" on public.profiles;
create policy "profiles insertable by admins"
  on public.profiles for insert to authenticated
  with check ((select private.is_admin()));
create policy "profiles updatable by admins"
  on public.profiles for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "profiles deletable by admins"
  on public.profiles for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "status options manageable by admins" on public.venue_status_options;
create policy "status options insertable by admins"
  on public.venue_status_options for insert to authenticated
  with check ((select private.is_admin()));
create policy "status options updatable by admins"
  on public.venue_status_options for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "status options deletable by admins"
  on public.venue_status_options for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "temperature options manageable by admins" on public.venue_temperature_options;
create policy "temperature options insertable by admins"
  on public.venue_temperature_options for insert to authenticated
  with check ((select private.is_admin()));
create policy "temperature options updatable by admins"
  on public.venue_temperature_options for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "temperature options deletable by admins"
  on public.venue_temperature_options for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "venues deletable by admins" on public.venues;
create policy "venues deletable by admins"
  on public.venues for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "venues insert by logged in users" on public.venues;
create policy "venues insert by logged in users"
  on public.venues for insert to authenticated
  with check ((select auth.uid()) is not null);

drop policy if exists "venues readable by logged in users" on public.venues;
create policy "venues readable by logged in users"
  on public.venues for select to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists "venues update by logged in users" on public.venues;
create policy "venues update by logged in users"
  on public.venues for update to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

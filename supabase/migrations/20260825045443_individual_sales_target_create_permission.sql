-- Allow administrators to delegate manual sales-target creation to selected staff.

alter table public.profiles
  add column if not exists can_create_sales_targets boolean not null default false;

create or replace function private.can_create_sales_targets()
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
      and active = true
      and (role = 'admin' or can_create_sales_targets = true)
  );
$$;

revoke all on function private.can_create_sales_targets() from public, anon;
grant execute on function private.can_create_sales_targets() to authenticated;

drop policy if exists "venues insertable by admins" on public.venues;
drop policy if exists "venues insertable by permitted users" on public.venues;
create policy "venues insertable by permitted users"
  on public.venues for insert to authenticated
  with check ((select private.can_create_sales_targets()));

create or replace function private.enforce_venue_write()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  is_admin boolean := (select private.is_admin());
  can_create boolean := (select private.can_create_sales_targets());
  is_profile_cleanup boolean := coalesce(current_setting('crm.profile_cleanup', true), '') = 'on';
begin
  if tg_op = 'INSERT' then
    if not can_create then
      raise exception 'You do not have permission to add sales targets.' using errcode = '42501';
    end if;

    if not is_admin and (new.is_hidden = true or new.assigned_user_id is not null) then
      raise exception 'Only administrators can set assignment or visibility when adding sales targets.' using errcode = '42501';
    end if;

    new.created_by := coalesce((select auth.uid()), new.created_by);
    new.updated_by := coalesce((select auth.uid()), new.updated_by);
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := now();
    new.lock_version := greatest(1, coalesce(new.lock_version, 1));
    return new;
  end if;

  if not is_admin
    and not is_profile_cleanup
    and (
      new.assigned_user_id is distinct from old.assigned_user_id
      or new.is_hidden is distinct from old.is_hidden
      or new.record_type is distinct from old.record_type
    ) then
    raise exception 'Only administrators can change assignment, visibility, or record type.' using errcode = '42501';
  end if;

  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_by := coalesce((select auth.uid()), old.updated_by);
  new.updated_at := now();
  new.lock_version := old.lock_version + 1;
  return new;
end;
$$;

revoke all on function private.enforce_venue_write() from public, anon, authenticated;

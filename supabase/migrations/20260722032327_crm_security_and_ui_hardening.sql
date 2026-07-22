-- Harden CRM data access, make imports conflict-safe, and keep Auth/profile data consistent.

create or replace function private.is_active_user()
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
  );
$$;

revoke all on function private.is_active_user() from public, anon;
grant execute on function private.is_active_user() to authenticated;

-- Staff need names for assignment and filtering, but not colleagues' login IDs or email addresses.
create or replace function public.list_profile_directory()
returns table (id uuid, name text, active boolean)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p.id, p.name, p.active
  from public.profiles p
  where (select private.is_active_user())
  order by p.active desc, p.name, p.id;
$$;

revoke all on function public.list_profile_directory() from public, anon, authenticated;
grant execute on function public.list_profile_directory() to authenticated;

drop policy if exists "profiles readable by signed in users" on public.profiles;
drop policy if exists "profiles readable by owner or admins" on public.profiles;
create policy "profiles readable by owner or admins"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "venues writable by signed in users" on public.venues;
drop policy if exists "venues editable by signed in users" on public.venues;
drop policy if exists "venues insert by logged in users" on public.venues;
drop policy if exists "venues update by logged in users" on public.venues;
drop policy if exists "venues readable by logged in users" on public.venues;
drop policy if exists "venues readable by signed in users" on public.venues;

create policy "venues insertable by admins"
  on public.venues for insert to authenticated
  with check ((select private.is_admin()));

create policy "venues readable by active users"
  on public.venues for select to authenticated
  using ((select private.is_active_user()));

create policy "venues updatable by active users"
  on public.venues for update to authenticated
  using ((select private.is_active_user()))
  with check ((select private.is_active_user()));

drop policy if exists "call histories writable by signed in users" on public.call_histories;
create policy "call histories writable by active users"
  on public.call_histories for insert to authenticated
  with check (
    (select private.is_active_user())
    and (changed_by_user_id = (select auth.uid()) or (select private.is_admin()))
  );

drop policy if exists "users manage own reminders" on public.call_reminders;
create policy "active users manage own reminders"
  on public.call_reminders for all to authenticated
  using (
    (select private.is_active_user())
    and (user_id = (select auth.uid()) or (select private.is_admin()))
  )
  with check (
    (select private.is_active_user())
    and (user_id = (select auth.uid()) or (select private.is_admin()))
  );

-- Keep provenance trustworthy and stop direct API calls from changing admin-only fields.
create or replace function private.enforce_venue_write()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  is_admin boolean := (select private.is_admin());
  is_profile_cleanup boolean := coalesce(current_setting('crm.profile_cleanup', true), '') = 'on';
begin
  if tg_op = 'INSERT' then
    if not is_admin then
      raise exception 'Only administrators can add venues.' using errcode = '42501';
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
drop trigger if exists venues_enforce_write on public.venues;
create trigger venues_enforce_write
  before insert or update on public.venues
  for each row execute function private.enforce_venue_write();

-- Auth creation and profile creation are part of one database transaction.
create or replace function private.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  profile_name text := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), nullif(split_part(new.email, '@', 1), ''), '未設定ユーザー');
  profile_login_id text := coalesce(nullif(lower(btrim(new.raw_user_meta_data ->> 'login_id')), ''), nullif(lower(split_part(new.email, '@', 1)), ''), new.id::text);
begin
  insert into public.profiles (id, name, login_id, email, role, active)
  values (new.id, profile_name, profile_login_id, new.email, 'staff', true)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.create_profile_for_auth_user() from public, anon, authenticated;
drop trigger if exists create_profile_for_auth_user on auth.users;
create trigger create_profile_for_auth_user
  after insert on auth.users
  for each row execute function private.create_profile_for_auth_user();

-- Deleting an Auth user cascades to its profile. Clear CRM references inside that same transaction.
create or replace function private.cleanup_profile_references()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform set_config('crm.profile_cleanup', 'on', true);

  update public.venues
  set
    assigned_user_id = case when assigned_user_id = old.id then null else assigned_user_id end,
    call_updated_by_user_id = case when call_updated_by_user_id = old.id then null else call_updated_by_user_id end,
    created_by = case when created_by = old.id then null else created_by end,
    updated_by = case when updated_by = old.id then null else updated_by end
  where old.id in (assigned_user_id, call_updated_by_user_id, created_by, updated_by);

  update public.call_histories
  set changed_by_user_id = null
  where changed_by_user_id = old.id;

  update public.call_reminders
  set user_id = null
  where user_id = old.id;

  delete from public.user_preferences where user_id = old.id;
  return old;
end;
$$;

revoke all on function private.cleanup_profile_references() from public, anon, authenticated;
drop trigger if exists cleanup_profile_references on public.profiles;
create trigger cleanup_profile_references
  before delete on public.profiles
  for each row execute function private.cleanup_profile_references();

-- The import API accepts normalized rows and reports optimistic-lock conflicts instead of overwriting them.
create or replace function public.import_venues(venue_rows jsonb)
returns table (id uuid, outcome text, lock_version integer)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
#variable_conflict use_column
begin
  if not (select private.is_admin()) then
    raise exception 'Only administrators can import venues.' using errcode = '42501';
  end if;

  if jsonb_typeof(venue_rows) <> 'array' then
    raise exception 'venue_rows must be a JSON array.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(venue_rows) as item(value)
    group by item.value ->> 'id'
    having count(*) > 1
  ) then
    raise exception 'The import contains duplicate venue IDs.' using errcode = '22023';
  end if;

  return query
  with incoming as (
    select
      record_row.*,
      nullif(item.value ->> 'expected_lock_version', '')::integer as expected_lock_version
    from jsonb_array_elements(venue_rows) as item(value)
    cross join lateral jsonb_populate_record(null::public.venues, item.value - 'expected_lock_version') as record_row
  ),
  inserted as (
    insert into public.venues (
      id, facility_name, category, record_type, operator, prefecture, municipality, address, phone, fax, email, website,
      department, contact_name, main_hall_name, seat_count, large_hall_seats, medium_hall_seats, small_hall_seats, genres,
      program_policy, status, temperature, is_hidden, assigned_user_id, last_contact_date, call_updated_at,
      call_updated_by_user_id, consideration_date, next_action_date, notification_lead_days, next_action, notes, notes_important
    )
    select
      i.id, i.facility_name, i.category, i.record_type, i.operator, i.prefecture, i.municipality, i.address, i.phone, i.fax, i.email, i.website,
      i.department, i.contact_name, i.main_hall_name, i.seat_count, i.large_hall_seats, i.medium_hall_seats, i.small_hall_seats, i.genres,
      i.program_policy, i.status, i.temperature, i.is_hidden, i.assigned_user_id, i.last_contact_date, i.call_updated_at,
      i.call_updated_by_user_id, i.consideration_date, i.next_action_date, i.notification_lead_days, i.next_action, i.notes, i.notes_important
    from incoming i
    where i.expected_lock_version is null
    on conflict (id) do nothing
    returning id, 'inserted'::text as outcome, lock_version
  ),
  updated as (
    update public.venues as venue
    set
      facility_name = i.facility_name,
      category = i.category,
      record_type = i.record_type,
      operator = i.operator,
      prefecture = i.prefecture,
      municipality = i.municipality,
      address = i.address,
      phone = i.phone,
      fax = i.fax,
      email = i.email,
      website = i.website,
      department = i.department,
      contact_name = i.contact_name,
      main_hall_name = i.main_hall_name,
      seat_count = i.seat_count,
      large_hall_seats = i.large_hall_seats,
      medium_hall_seats = i.medium_hall_seats,
      small_hall_seats = i.small_hall_seats,
      genres = i.genres,
      program_policy = i.program_policy,
      status = i.status,
      temperature = i.temperature,
      is_hidden = i.is_hidden,
      assigned_user_id = i.assigned_user_id,
      last_contact_date = i.last_contact_date,
      call_updated_at = i.call_updated_at,
      call_updated_by_user_id = i.call_updated_by_user_id,
      consideration_date = i.consideration_date,
      next_action_date = i.next_action_date,
      notification_lead_days = i.notification_lead_days,
      next_action = i.next_action,
      notes = i.notes,
      notes_important = i.notes_important
    from incoming i
    where i.expected_lock_version is not null
      and venue.id = i.id
      and venue.lock_version = i.expected_lock_version
    returning venue.id, 'updated'::text as outcome, venue.lock_version
  )
  select id, outcome, lock_version from inserted
  union all
  select id, outcome, lock_version from updated
  union all
  select i.id, 'conflict'::text, coalesce(current_row.lock_version, 0)
  from incoming i
  left join inserted on inserted.id = i.id
  left join updated on updated.id = i.id
  left join public.venues as current_row on current_row.id = i.id
  where inserted.id is null
    and updated.id is null;
end;
$$;

revoke all on function public.import_venues(jsonb) from public, anon, authenticated;
grant execute on function public.import_venues(jsonb) to authenticated;

-- The function result columns share names with venue columns. Resolve bare names as columns.
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

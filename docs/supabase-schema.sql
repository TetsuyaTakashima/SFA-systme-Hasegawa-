create type public.user_role as enum ('admin', 'staff');
create type public.temperature_level as enum ('A', 'B', 'C', 'D', 'E');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  login_id text not null unique,
  email text,
  role public.user_role not null default 'staff',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venue_status_options (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  color text not null default '#3d7a52',
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venue_temperature_options (
  level public.temperature_level primary key,
  label text not null,
  sort_order integer not null default 0,
  color text not null default '#5b6f82',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  column_order jsonb not null default '[]'::jsonb,
  pinned_columns jsonb not null default '[]'::jsonb,
  visible_columns jsonb not null default '[]'::jsonb,
  notification_lead_days integer not null default 3,
  notification_popup_lead_days integer not null default 3,
  notification_display_mode text not null default 'badge',
  notification_scope text not null default 'assigned',
  notification_dismiss_condition text not null default 'nextActionDate',
  notification_enabled boolean not null default false,
  notification_notified jsonb not null default '{}'::jsonb,
  notification_dismissed jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (notification_display_mode in ('badge', 'badgeDays', 'days', 'date')),
  check (notification_scope in ('assigned', 'all')),
  check (notification_dismiss_condition in ('nextActionDate', 'status', 'either'))
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  facility_name text not null,
  category text,
  operator text,
  prefecture text,
  municipality text,
  address text,
  phone text,
  fax text,
  email text,
  website text,
  department text,
  contact_name text,
  main_hall_name text,
  seat_count integer,
  large_hall_seats integer,
  medium_hall_seats integer,
  small_hall_seats integer,
  genres text,
  program_policy text not null default '△' check (program_policy in ('○', '△', '×')),
  status text not null default '未着手',
  temperature public.temperature_level not null default 'B',
  is_hidden boolean not null default false,
  assigned_user_id uuid references public.profiles(id),
  last_contact_date date,
  call_updated_at timestamptz,
  call_updated_by_user_id uuid references public.profiles(id),
  consideration_date date,
  next_action_date date,
  notification_lead_days integer check (notification_lead_days between 0 and 365),
  next_action text,
  notes text,
  notes_important boolean not null default false,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  lock_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.call_reminders (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid references public.profiles(id),
  next_action_date date not null,
  notification_channel text not null default 'browser',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (venue_id, user_id, next_action_date, notification_channel)
);

create table public.call_histories (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  field text not null,
  field_label text not null,
  previous_value text,
  next_value text,
  changed_by_user_id uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.venue_status_options enable row level security;
alter table public.venue_temperature_options enable row level security;
alter table public.user_preferences enable row level security;
alter table public.venues enable row level security;
alter table public.call_reminders enable row level security;
alter table public.call_histories enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create policy "profiles readable by signed in users"
on public.profiles for select
to authenticated
using (true);

create policy "profiles manageable by admins"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "status options readable by signed in users"
on public.venue_status_options for select
to authenticated
using (true);

create policy "status options manageable by admins"
on public.venue_status_options for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "temperature options readable by signed in users"
on public.venue_temperature_options for select
to authenticated
using (true);

create policy "temperature options manageable by admins"
on public.venue_temperature_options for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "preferences readable by owner or admins"
on public.user_preferences for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "preferences manageable by owner or admins"
on public.user_preferences for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "venues readable by signed in users"
on public.venues for select
to authenticated
using (true);

create policy "venues writable by signed in users"
on public.venues for insert
to authenticated
with check (true);

create policy "venues editable by signed in users"
on public.venues for update
to authenticated
using (true)
with check (true);

create policy "venues deletable by admins"
on public.venues for delete
to authenticated
using (public.is_admin());

create policy "reminders readable by assignee or admins"
on public.call_reminders for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "reminders writable by signed in users"
on public.call_reminders for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy "call histories readable by admins"
on public.call_histories for select
to authenticated
using (public.is_admin());

create policy "call histories writable by signed in users"
on public.call_histories for insert
to authenticated
with check (changed_by_user_id = auth.uid() or public.is_admin());

grant usage on schema public to authenticated;
grant execute on function public.is_admin() to authenticated;
grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select on public.venue_status_options to authenticated;
grant insert, update, delete on public.venue_status_options to authenticated;
grant select on public.venue_temperature_options to authenticated;
grant insert, update, delete on public.venue_temperature_options to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.venues to authenticated;
grant select, insert, update, delete on public.call_reminders to authenticated;
grant select, insert on public.call_histories to authenticated;

insert into public.venue_status_options (name, sort_order, color, is_closed)
values
  ('未着手', 1, '#3d7a52', false),
  ('情報収集中', 2, '#1d6a73', false),
  ('初回連絡済', 3, '#5d6780', false),
  ('提案中', 4, '#9b6b00', false),
  ('見積・調整中', 5, '#9b6b00', false),
  ('成約', 6, '#265f9e', true),
  ('保留', 7, '#666666', true),
  ('架電NG', 8, '#5f6865', true)
on conflict (name) do update set
  sort_order = excluded.sort_order,
  color = excluded.color,
  is_closed = excluded.is_closed,
  updated_at = now();

insert into public.venue_temperature_options (level, label, sort_order, color)
values
  ('A', '高い', 1, '#c63f2d'),
  ('B', '前向き', 2, '#b86b00'),
  ('C', '通常', 3, '#5b6f82'),
  ('D', '低め', 4, '#6c7a70'),
  ('E', '見送り', 5, '#6b6f73')
on conflict (level) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  color = excluded.color,
  updated_at = now();

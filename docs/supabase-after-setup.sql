alter table public.user_preferences
  add column if not exists notification_enabled boolean not null default false,
  add column if not exists notification_notified jsonb not null default '{}'::jsonb,
  add column if not exists notification_dismissed jsonb not null default '{}'::jsonb;

alter table public.profiles enable row level security;
alter table public.venue_status_options enable row level security;
alter table public.venue_temperature_options enable row level security;
alter table public.user_preferences enable row level security;
alter table public.venues enable row level security;
alter table public.call_reminders enable row level security;

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

drop policy if exists "profiles readable by signed in users" on public.profiles;
drop policy if exists "profiles manageable by admins" on public.profiles;

create policy "profiles readable by signed in users"
on public.profiles for select
to authenticated
using (true);

create policy "profiles manageable by admins"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

do $$
declare
  admin_auth_id uuid;
begin
  select id
  into admin_auth_id
  from auth.users
  where email = 'admin@crm.local'
  limit 1;

  if admin_auth_id is not null then
    delete from public.profiles
    where login_id = 'admin'
      and id <> admin_auth_id;

    insert into public.profiles (id, name, login_id, email, role, active)
    values (admin_auth_id, '管理者', 'admin', 'admin@crm.local', 'admin', true)
    on conflict (id) do update set
      name = excluded.name,
      login_id = excluded.login_id,
      email = excluded.email,
      role = excluded.role,
      active = true,
      updated_at = now();
  end if;
end $$;

drop policy if exists "status options readable by signed in users" on public.venue_status_options;
drop policy if exists "status options manageable by admins" on public.venue_status_options;
drop policy if exists "temperature options readable by signed in users" on public.venue_temperature_options;
drop policy if exists "temperature options manageable by admins" on public.venue_temperature_options;
drop policy if exists "preferences readable by owner or admins" on public.user_preferences;
drop policy if exists "preferences manageable by owner or admins" on public.user_preferences;
drop policy if exists "venues readable by signed in users" on public.venues;
drop policy if exists "venues writable by signed in users" on public.venues;
drop policy if exists "venues editable by signed in users" on public.venues;
drop policy if exists "venues deletable by admins" on public.venues;
drop policy if exists "venues readable by logged in users" on public.venues;
drop policy if exists "venues insert by logged in users" on public.venues;
drop policy if exists "venues update by logged in users" on public.venues;

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

create policy "venues readable by logged in users"
on public.venues for select
to public
using (auth.uid() is not null);

create policy "venues insert by logged in users"
on public.venues for insert
to public
with check (auth.uid() is not null);

create policy "venues update by logged in users"
on public.venues for update
to public
using (auth.uid() is not null)
with check (auth.uid() is not null);

create table if not exists public.call_histories (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  field text not null,
  field_label text not null,
  previous_value text,
  next_value text,
  changed_by_user_id uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

alter table public.call_histories enable row level security;

drop policy if exists "call histories readable by admins" on public.call_histories;
drop policy if exists "call histories writable by signed in users" on public.call_histories;

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

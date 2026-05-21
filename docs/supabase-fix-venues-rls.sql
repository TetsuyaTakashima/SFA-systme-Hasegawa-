drop policy if exists "venues readable by signed in users" on public.venues;
drop policy if exists "venues writable by signed in users" on public.venues;
drop policy if exists "venues editable by signed in users" on public.venues;
drop policy if exists "venues deletable by admins" on public.venues;
drop policy if exists "venues readable by logged in users" on public.venues;
drop policy if exists "venues insert by logged in users" on public.venues;
drop policy if exists "venues update by logged in users" on public.venues;

create policy "venues readable by logged in users"
on public.venues for select
to authenticated
using (auth.uid() is not null);

create policy "venues insert by logged in users"
on public.venues for insert
to authenticated
with check (auth.uid() is not null);

create policy "venues update by logged in users"
on public.venues for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "venues deletable by admins"
on public.venues for delete
to authenticated
using (public.is_admin());

grant select, insert, update, delete on public.venues to authenticated;

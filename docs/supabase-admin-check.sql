-- Supabase SQL Editorで実行して、初期管理者のAuthユーザーとprofileを確認します。
-- ログインID admin は、アプリ内で admin@crm.local としてSupabase Authへ送信されます。

select
  id,
  email,
  email_confirmed_at,
  created_at
from auth.users
where email = 'admin@crm.local';

select
  id,
  name,
  login_id,
  email,
  role,
  active
from public.profiles
where login_id = 'admin';

-- Authentication > Users で admin@crm.local / password のユーザーを作成したあと、
-- profileが未作成、またはAuthユーザーとidが違う場合は下記を実行します。

insert into public.profiles (id, name, login_id, email, role, active)
select
  id,
  '管理者',
  'admin',
  email,
  'admin',
  true
from auth.users
where email = 'admin@crm.local'
on conflict (id) do update set
  name = excluded.name,
  login_id = excluded.login_id,
  email = excluded.email,
  role = excluded.role,
  active = true,
  updated_at = now();

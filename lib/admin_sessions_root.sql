-- Run this ONCE in Supabase (SQL Editor) if you already created admin_sessions earlier.
-- It lets the main admin's logins be recorded too.
alter table admin_sessions drop constraint if exists admin_sessions_username_fkey;
alter table admin_sessions add column if not exists is_root boolean not null default false;

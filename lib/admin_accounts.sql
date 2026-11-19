-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists admin_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,   -- scrypt hash, used to verify logins
  password_enc text not null,    -- AES-GCM encrypted, only so the main admin can reveal it with the eye icon
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Lock the table: the public (anon) key must NOT be able to read or write it.
-- Only the server (service role key) can access it.
alter table admin_accounts enable row level security;
revoke all on admin_accounts from anon, authenticated;

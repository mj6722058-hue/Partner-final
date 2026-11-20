-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
-- (If you already ran an older version of this file, run lib/admin_sessions_root.sql instead.)
create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  is_root boolean not null default false,  -- true = login with the main admin username/password
  login_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  logout_at timestamptz,
  -- device
  device_type text, device_model text,
  os text, os_version text,
  browser text, browser_version text,
  screen text, language text, timezone text, user_agent text,
  -- approximate location (from IP address)
  ip text, city text, region text, country text,
  ip_lat double precision, ip_lon double precision,
  -- exact location (only if the person allowed it in their browser)
  gps_status text,
  gps_lat double precision, gps_lon double precision, gps_accuracy double precision, gps_at timestamptz
);
create index if not exists admin_sessions_user_idx on admin_sessions (username, login_at desc);

-- Lock the table: the public (anon) key must NOT be able to read or write it.
alter table admin_sessions enable row level security;
revoke all on admin_sessions from anon, authenticated;

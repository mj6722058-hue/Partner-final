-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create sequence if not exists drivers_list_no_seq;

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  list_no bigint not null default nextval('drivers_list_no_seq') unique,
  first_name text not null,
  last_name text not null,
  gender text not null check (gender in ('male','female')),
  country_code text not null,  -- e.g. '+92'
  phone text not null unique,  -- national number, digits only
  username text not null unique,
  password_hash text not null,
  password_enc text not null,
  selfie_url text, id_front_url text, id_back_url text,
  lic_front_url text, lic_back_url text,
  car_images text[] not null default '{}',
  car_company text, car_name text, car_model text,
  status text not null default 'active' check (status in ('active','blocked')),
  rating numeric(2,1) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists drivers_search_idx on drivers (list_no, phone);

create table if not exists driver_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,        -- full number including country code, e.g. +923001234567
  code_hash text not null,
  purpose text not null default 'driver_signup',
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists driver_otps_phone_idx on driver_otps (phone, created_at desc);

create table if not exists driver_comments (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  passenger_id uuid, -- references passengers(id) once that table exists; left loose on purpose
  passenger_name text,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Lock everything: only the server (service role key) may read/write these tables.
alter table drivers enable row level security;
revoke all on drivers from anon, authenticated;
alter table driver_otps enable row level security;
revoke all on driver_otps from anon, authenticated;
alter table driver_comments enable row level security;
revoke all on driver_comments from anon, authenticated;

-- Private storage bucket for ID/selfie/car photos. Only the server can read or write it (signed URLs for viewing).
insert into storage.buckets (id, name, public)
values ('driver-media', 'driver-media', false)
on conflict (id) do nothing;

-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
-- (lib/drivers.sql must already be run, for the driver_comments table and the driver-media bucket.)
create sequence if not exists passengers_list_no_seq;

create table if not exists passengers (
  id uuid primary key default gen_random_uuid(),
  list_no bigint not null default nextval('passengers_list_no_seq') unique,
  first_name text not null,
  last_name text not null,
  gender text not null check (gender in ('male','female')),
  country_code text not null,
  phone text not null unique,
  username text not null unique,
  password_hash text not null,
  password_enc text not null,
  selfie_url text, id_front_url text, id_back_url text,
  status text not null default 'active' check (status in ('active','blocked')),
  rating numeric(2,1) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists passengers_search_idx on passengers (list_no, phone);

create table if not exists passenger_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists passenger_otps_phone_idx on passenger_otps (phone, created_at desc);

-- Let driver_comments properly reference a passenger now that the table exists.
alter table driver_comments drop constraint if exists driver_comments_passenger_id_fkey;
alter table driver_comments add constraint driver_comments_passenger_id_fkey
  foreign key (passenger_id) references passengers(id) on delete set null;

-- Mirror table: comments a passenger leaves about a driver already live in driver_comments (driver_id + passenger_id).
-- This table holds the other direction: what a driver says about a passenger.
create table if not exists passenger_comments (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references passengers(id) on delete cascade,
  driver_id uuid references drivers(id) on delete set null,
  driver_name text,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table passengers enable row level security;
revoke all on passengers from anon, authenticated;
alter table passenger_otps enable row level security;
revoke all on passenger_otps from anon, authenticated;
alter table passenger_comments enable row level security;
revoke all on passenger_comments from anon, authenticated;

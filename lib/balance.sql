-- Run this once in Supabase, AFTER lib/drivers.sql, lib/passengers.sql and lib/moderation.sql
-- Adds a driver wallet/balance and a ledger of ride-commission deductions (or manual top-ups).
-- There is no real ride engine yet, so entries are added by the admin from the Balance screen
-- until a driver app exists that can post these automatically.

alter table drivers add column if not exists balance numeric not null default 0;

create table if not exists driver_transactions (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(id) on delete cascade,
  ride_detail text not null,
  percent numeric not null default 0,
  amount numeric not null,
  type text not null default 'debit' check (type in ('debit','credit')),
  created_at timestamptz not null default now()
);

create index if not exists driver_transactions_driver_id_idx on driver_transactions(driver_id, created_at desc);

alter table driver_transactions enable row level security;
-- All access to this table happens through the server's service-role key (adminDb()), never from the browser,
-- so no public policies are added here — same pattern as drivers/passengers.

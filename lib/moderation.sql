-- Run this once in Supabase, AFTER lib/drivers.sql and lib/passengers.sql
-- Adds: "Other" gender option, timed blocking (with auto-unblock), online/offline tracking,
-- and 4 fixed car photo slots (Front/Back/Left/Right) instead of an open-ended list.

alter table drivers drop constraint if exists drivers_gender_check;
alter table drivers add constraint drivers_gender_check check (gender in ('male','female','other'));
alter table drivers add column if not exists blocked_until timestamptz; -- null = permanent block (when status='blocked'); set = temporary, auto-unblocks when it passes
alter table drivers add column if not exists last_active timestamptz;  -- updated by the driver app once it exists; used for Online/Offline
alter table drivers add column if not exists car_front_url text;
alter table drivers add column if not exists car_back_url text;
alter table drivers add column if not exists car_left_url text;
alter table drivers add column if not exists car_right_url text;

alter table passengers drop constraint if exists passengers_gender_check;
alter table passengers add constraint passengers_gender_check check (gender in ('male','female','other'));
alter table passengers add column if not exists blocked_until timestamptz;
alter table passengers add column if not exists last_active timestamptz;

-- Migration 01: spend amount, server name, "completed" status.
-- Run ONCE in Supabase (SQL Editor > New query > paste > Run),
-- same way as supabase-setup.sql. Existing data is kept.

alter table public.reservations
  add column if not exists spend_amount integer check (spend_amount >= 0), -- thousands of IDR, menu convention
  add column if not exists server_name text check (char_length(server_name) <= 60);

alter table public.reservations drop constraint reservations_status_check;
alter table public.reservations add constraint reservations_status_check
  check (status in ('pending','confirmed','cancelled','seated','completed','no_show'));

-- Recreate the visitor policy so the new staff-only fields stay untouchable from the site.
drop policy "public can request a table" on public.reservations;
create policy "public can request a table" on public.reservations
  for insert to anon
  with check (
    status = 'pending'
    and table_assignment is null
    and spend_amount is null
    and server_name is null
    and date >= (now() at time zone 'Asia/Makassar')::date
  );

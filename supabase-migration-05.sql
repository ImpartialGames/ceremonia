-- Migration 05: guide referral program.
-- Guides bring guests to Ceremonia and earn 10% of the bill. Each guide has
-- a reference code; the reservation form stores it, the manager's Guides tab
-- in /admin creates codes and shows monthly stats. Run once in the SQL Editor.

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 80),
  code text not null unique check (code ~ '^[A-Z0-9-]{3,24}$'),
  phone text check (char_length(phone) <= 40),
  active boolean not null default true
);
alter table public.guides enable row level security;
create policy "staff read guides" on public.guides
  for select to authenticated using (true);
create policy "staff insert guides" on public.guides
  for insert to authenticated with check (true);
create policy "staff update guides" on public.guides
  for update to authenticated using (true) with check (true);

alter table public.reservations
  add column if not exists guide_code text check (char_length(guide_code) <= 24);
create index if not exists reservations_guide_idx
  on public.reservations (guide_code) where guide_code is not null;

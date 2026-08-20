-- Ceremonia reservations: run ONCE in Supabase (SQL Editor > New query > paste > Run).
--
-- Setup checklist (in the Supabase dashboard):
--   1. Create a free project at supabase.com (region: Singapore, closest to Bali).
--   2. Run this whole file in the SQL Editor.
--   3. Authentication > Sign In / Providers > Email: DISABLE "Allow new users to sign up".
--      This is MANDATORY: staff read access is granted to any logged-in user,
--      so account creation must stay in your hands.
--   4. Authentication > Users > Add user: create one account per staff member
--      (email + password, check "Auto Confirm User").
--   5. Project Settings > API: copy the Project URL and the anon public key
--      into supabase-config.js, then deploy the site.

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (position('@' in email) > 1 and char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  date date not null,
  time_slot text not null check (time_slot ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  party_size int not null check (party_size between 1 and 20),
  notes text check (char_length(notes) <= 500),
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','seated','no_show')),
  table_assignment text check (char_length(table_assignment) <= 40)
);

alter table public.reservations enable row level security;

-- Visitors (anon key) may only CREATE pending requests for today or later,
-- Bali time. They can never read, update or delete anything.
create policy "public can request a table" on public.reservations
  for insert to anon
  with check (
    status = 'pending'
    and table_assignment is null
    and date >= (now() at time zone 'Asia/Makassar')::date
  );

-- Staff (any logged-in user, signups disabled per step 3) manage everything.
-- No delete policy on purpose: cancelling is a status change, history is kept.
create policy "staff can read" on public.reservations
  for select to authenticated using (true);
create policy "staff can update" on public.reservations
  for update to authenticated using (true) with check (true);

create index reservations_date_idx on public.reservations (date, time_slot);

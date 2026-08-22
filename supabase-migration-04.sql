-- Migration 04: decline reason + explanation email to the guest.
-- TEMPLATE (this file is public on the website): replace APPS_SCRIPT_URL_HERE
-- and SECRET_HERE before running in the Supabase SQL Editor.

alter table public.reservations
  add column if not exists decline_reason text check (char_length(decline_reason) <= 40);

drop policy "public can request a table" on public.reservations;
create policy "public can request a table" on public.reservations
  for insert to anon
  with check (
    status = 'pending'
    and table_assignment is null
    and spend_amount is null
    and server_name is null
    and decline_reason is null
    and date >= (now() at time zone 'Asia/Makassar')::date
  );

-- The same trigger now sends either the confirmation email (accepted)
-- or the explanation email (refused with a reason). The automatic expiry
-- from pg_cron sets no reason, so it never emails anyone.
create or replace function public.notify_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public, net
as $$
begin
  if new.status = 'confirmed' and old.status = 'pending' and new.email is not null then
    perform net.http_post(
      url := 'APPS_SCRIPT_URL_HERE',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object(
        'secret', 'SECRET_HERE',
        'to', new.email, 'name', new.name,
        'date', new.date, 'time', new.time_slot, 'party', new.party_size
      )
    );
  elsif new.status = 'cancelled' and old.status = 'pending'
        and new.decline_reason is not null and new.email is not null then
    perform net.http_post(
      url := 'APPS_SCRIPT_URL_HERE',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object(
        'secret', 'SECRET_HERE', 'type', 'declined',
        'to', new.email, 'name', new.name,
        'date', new.date, 'time', new.time_slot, 'reason', new.decline_reason
      )
    );
  end if;
  return new;
end $$;

-- Migration 02: automatic confirmation email to the guest.
-- When the staff accepts a request (status pending -> confirmed), the database
-- calls a Google Apps Script web app that sends the email from ceremoniaubud@gmail.com.
--
-- This file is a TEMPLATE (it is public on the website): before running it in
-- the Supabase SQL Editor, replace the two placeholders:
--   APPS_SCRIPT_URL_HERE  ->  the /exec URL of the deployed Apps Script
--   SECRET_HERE           ->  the shared secret (same value as in the script)

create extension if not exists pg_net;

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
        'to', new.email,
        'name', new.name,
        'date', new.date,
        'time', new.time_slot,
        'party', new.party_size
      )
    );
  end if;
  return new;
end $$;

drop trigger if exists reservations_confirmation_email on public.reservations;
create trigger reservations_confirmation_email
after update of status on public.reservations
for each row execute function public.notify_confirmation();

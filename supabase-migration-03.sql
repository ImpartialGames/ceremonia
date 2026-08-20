-- Migration 03: automatic lifecycle, run every 15 minutes by pg_cron.
--   1. 2 hours after the booking time (Bali), confirmed/seated bookings close
--      automatically (status completed), freeing the table in the back office.
--      Unanswered pending requests expire to cancelled at the same point.
--   2. 3 hours after the booking time, completed bookings get a Google review
--      email (same Apps Script sender as the confirmation email), once only.
--
-- This file is a TEMPLATE (it is public on the website): before running it in
-- the Supabase SQL Editor, replace APPS_SCRIPT_URL_HERE and SECRET_HERE.

create extension if not exists pg_cron;

alter table public.reservations
  add column if not exists review_sent boolean not null default false;

create or replace function public.process_reservation_lifecycle()
returns void
language plpgsql
security definer
set search_path = public, net
as $$
declare
  bali_now timestamp := now() at time zone 'Asia/Makassar';
  r record;
begin
  update public.reservations set status = 'completed'
    where status in ('confirmed','seated')
      and (date + time_slot::time) < bali_now - interval '2 hours';

  update public.reservations set status = 'cancelled'
    where status = 'pending'
      and (date + time_slot::time) < bali_now - interval '2 hours';

  for r in
    select id, name, email from public.reservations
    where status = 'completed' and review_sent = false and email is not null
      and (date + time_slot::time) < bali_now - interval '3 hours'
      and (date + time_slot::time) > bali_now - interval '24 hours' -- never mass-mail old history
  loop
    perform net.http_post(
      url := 'APPS_SCRIPT_URL_HERE',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('secret','SECRET_HERE','type','review','to',r.email,'name',r.name)
    );
    update public.reservations set review_sent = true where id = r.id;
  end loop;
end $$;

do $$
declare j record;
begin
  for j in select jobid from cron.job where jobname = 'reservation-lifecycle'
  loop perform cron.unschedule(j.jobid); end loop;
end $$;

select cron.schedule('reservation-lifecycle', '*/15 * * * *',
  'select public.process_reservation_lifecycle()');

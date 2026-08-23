-- Migration 06: auto-accept unanswered requests after 30 minutes.
-- A pending request older than 30 minutes whose slot is still ahead becomes
-- confirmed automatically; the existing email trigger then sends the guest
-- confirmation and the internal copy, exactly as a manual Accept.
-- The scheduler cadence tightens from 15 to 5 minutes.
-- (Auto-assigning a server and a table will come with the table plan.)
--
-- TEMPLATE (this file is public on the website): replace APPS_SCRIPT_URL_HERE
-- and SECRET_HERE before running in the Supabase SQL Editor.

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
  -- auto-accept: pending for 30+ minutes and the slot is still ahead
  update public.reservations set status = 'confirmed'
    where status = 'pending'
      and created_at < now() - interval '30 minutes'
      and (date + time_slot::time) > bali_now;

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
      and (date + time_slot::time) > bali_now - interval '24 hours'
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

select cron.schedule('reservation-lifecycle', '*/5 * * * *',
  'select public.process_reservation_lifecycle()');

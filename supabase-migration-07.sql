-- Migration 07: let the manager delete guide accounts from /manager.
-- Deleting a guide removes it from the list and its code stops working for
-- new bookings (the guide_codes view only exposes existing active codes).
-- Past reservations keep their guide_code and show under "Unknown code".
-- Run once in the SQL Editor.

create policy "staff delete guides" on public.guides
  for delete to authenticated using (true);

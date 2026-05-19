-- ============================================
-- YILLAR · 0005 — Fix rooms.code type
-- ============================================
-- char(4) pads values with spaces; PostgREST trims them in JSON output.
-- This caused the Realtime payload to return a truncated code (e.g. "S"
-- instead of "SABCD"), breaking navigation on game start.
-- Fix: change to text + explicit CHECK constraint.
-- Also add REPLICA IDENTITY FULL so Realtime UPDATE/DELETE events include
-- the full row (required for server-side filters on non-PK columns).

alter table public.rooms
  alter column code type text;

alter table public.rooms
  add constraint rooms_code_format
  check (length(code) = 4 and code = upper(code));

alter table public.rooms         replica identity full;
alter table public.room_players  replica identity full;
alter table public.room_guesses  replica identity full;

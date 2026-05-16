-- ============================================
-- YILLAR · 0003 — Explicit Data API grants
-- ============================================
-- Starting May 30 2026, Supabase no longer grants public-schema
-- table access to API roles by default. This migration makes all
-- grants explicit so they survive project recreation and the
-- October 30 2026 enforcement deadline.

-- tracks: public read + service_role for import scripts
grant select on public.tracks to anon, authenticated;
grant select, insert, update, delete on public.tracks to service_role;

-- profiles: anyone can read, only the owner can write (RLS enforces the rest)
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;

-- games / game_players / placements: authenticated only (host writes, RLS enforces ownership)
grant select, insert, update on public.games to authenticated;
grant select, insert, update on public.game_players to authenticated;
grant select, insert on public.placements to authenticated;

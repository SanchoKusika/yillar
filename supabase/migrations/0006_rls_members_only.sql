-- ============================================
-- YILLAR · 0006 — RLS: room_players visible only to room members
-- ============================================
-- Ранее room_players был доступен всем (using (true)), что позволяло
-- перечислять игроков любой комнаты через anon-ключ.
--
-- rooms остаётся открытым для SELECT — это нужно для flow вступления:
-- пользователь ищет комнату по коду ещё до попадания в room_players.
-- TODO(private-rooms): заменить rooms SELECT на SECURITY DEFINER-функцию
--   и добавить колонку is_public для публичных/приватных комнат.

drop policy if exists "room_players: anyone can read" on public.room_players;

create policy "room_players: members can read"
  on public.room_players for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.room_players rp
      where rp.room_id = room_players.room_id
        and rp.player_id = auth.uid()
    )
  );

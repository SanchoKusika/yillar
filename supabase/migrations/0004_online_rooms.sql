-- ============================================
-- YILLAR · 0004 — Online multiplayer rooms
-- ============================================
-- Онлайн-режим: каждый игрок на своём устройстве.
-- room → room_players → room_guesses
-- Realtime подписки читают эти таблицы.

-- ============================================
-- rooms — активные комнаты
-- ============================================
create table if not exists public.rooms (
  id               uuid primary key default gen_random_uuid(),
  code             char(4) not null unique,
  host_id          uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'waiting'
                   check (status in ('waiting', 'playing', 'ended')),
  track_ids        uuid[] not null default '{}',
  current_track_idx int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists rooms_code_idx on public.rooms (code);
create index if not exists rooms_host_idx  on public.rooms (host_id);

alter table public.rooms enable row level security;

drop policy if exists "rooms: anyone can read"   on public.rooms;
drop policy if exists "rooms: auth can insert"   on public.rooms;
drop policy if exists "rooms: host can update"   on public.rooms;
drop policy if exists "rooms: host can delete"   on public.rooms;

create policy "rooms: anyone can read"
  on public.rooms for select
  to authenticated, anon
  using (true);

create policy "rooms: auth can insert"
  on public.rooms for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "rooms: host can update"
  on public.rooms for update
  to authenticated
  using  (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "rooms: host can delete"
  on public.rooms for delete
  to authenticated
  using (host_id = auth.uid());

-- Auto-update updated_at
create or replace function public.rooms_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_updated_at on public.rooms;
create trigger rooms_updated_at
  before update on public.rooms
  for each row execute function public.rooms_set_updated_at();

-- ============================================
-- room_players — участники комнаты
-- ============================================
create table if not exists public.room_players (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.rooms(id) on delete cascade,
  player_id  uuid not null,                   -- auth.uid() (включая анонимных)
  name       text not null,
  era        era,
  is_host    boolean not null default false,
  joined_at  timestamptz not null default now(),
  unique (room_id, player_id)
);

create index if not exists room_players_room_idx on public.room_players (room_id);

alter table public.room_players enable row level security;

drop policy if exists "room_players: anyone can read"   on public.room_players;
drop policy if exists "room_players: auth can insert"   on public.room_players;
drop policy if exists "room_players: own can update"    on public.room_players;
drop policy if exists "room_players: own can delete"    on public.room_players;

create policy "room_players: anyone can read"
  on public.room_players for select
  to authenticated, anon
  using (true);

create policy "room_players: auth can insert"
  on public.room_players for insert
  to authenticated
  with check (player_id = auth.uid());

create policy "room_players: own can update"
  on public.room_players for update
  to authenticated
  using  (player_id = auth.uid())
  with check (player_id = auth.uid());

create policy "room_players: own can delete"
  on public.room_players for delete
  to authenticated
  using (player_id = auth.uid());

-- ============================================
-- room_guesses — ответы игроков
-- ============================================
create table if not exists public.room_guesses (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  track_idx    int  not null,
  player_id    uuid not null,
  guess_year   int  not null check (guess_year between 1900 and 2100),
  submitted_at timestamptz not null default now(),
  unique (room_id, track_idx, player_id)
);

create index if not exists room_guesses_room_track_idx
  on public.room_guesses (room_id, track_idx);

alter table public.room_guesses enable row level security;

drop policy if exists "room_guesses: room members can read" on public.room_guesses;
drop policy if exists "room_guesses: auth can insert own"   on public.room_guesses;

create policy "room_guesses: room members can read"
  on public.room_guesses for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.room_players rp
      where rp.room_id = room_id and rp.player_id = auth.uid()
    )
  );

create policy "room_guesses: auth can insert own"
  on public.room_guesses for insert
  to authenticated
  with check (
    player_id = auth.uid()
    and exists (
      select 1 from public.room_players rp
      where rp.room_id = room_id and rp.player_id = auth.uid()
    )
  );

-- ============================================
-- Realtime — включаем публикацию изменений
-- ============================================
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.room_guesses;

-- ============================================
-- YILLAR · 0002 — Profiles + game history
-- ============================================
-- Аккаунты (regular + anonymous) и сохранение партий.
-- Pass-and-play: хост — единственный залогиненный игрок,
-- остальные участники сохраняются как guest_name.

-- ============================================
-- profiles — расширение auth.users
-- ============================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text,
  display_name text,
  generation   era,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles enable row level security;

drop policy if exists "profiles: read all"   on public.profiles;
drop policy if exists "profiles: insert self" on public.profiles;
drop policy if exists "profiles: update self" on public.profiles;

create policy "profiles: read all"
  on public.profiles for select
  to authenticated, anon
  using (true);

create policy "profiles: insert self"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles: update self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Триггер: автоматически создаём profile при insert в auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- games — сессии партий
-- ============================================
create table if not exists public.games (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid references auth.users(id) on delete set null,
  status      text not null default 'ended'
              check (status in ('lobby','playing','reveal','ended')),
  total_cards int  not null,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);

create index if not exists games_host_idx on public.games (host_id, started_at desc);

alter table public.games enable row level security;

drop policy if exists "games: host can read"   on public.games;
drop policy if exists "games: host can insert" on public.games;
drop policy if exists "games: host can update" on public.games;

create policy "games: host can read"
  on public.games for select
  to authenticated
  using (host_id = auth.uid());

create policy "games: host can insert"
  on public.games for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "games: host can update"
  on public.games for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

-- ============================================
-- game_players — участники партии
-- ============================================
create table if not exists public.game_players (
  id           uuid primary key default gen_random_uuid(),
  game_id      uuid not null references public.games(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  guest_name   text,
  display_name text not null,
  generation   era,
  total_score  int  not null default 0,
  rank         int,
  is_winner    boolean not null default false
);

create index if not exists game_players_game_idx on public.game_players (game_id);

alter table public.game_players enable row level security;

drop policy if exists "game_players: read by host"   on public.game_players;
drop policy if exists "game_players: insert by host" on public.game_players;
drop policy if exists "game_players: update by host" on public.game_players;

create policy "game_players: read by host"
  on public.game_players for select
  to authenticated
  using (
    exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

create policy "game_players: insert by host"
  on public.game_players for insert
  to authenticated
  with check (
    exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

create policy "game_players: update by host"
  on public.game_players for update
  to authenticated
  using (
    exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  )
  with check (
    exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

-- ============================================
-- placements — каждый ход в партии
-- ============================================
create table if not exists public.placements (
  id              uuid primary key default gen_random_uuid(),
  game_id         uuid not null references public.games(id) on delete cascade,
  game_player_id  uuid not null references public.game_players(id) on delete cascade,
  track_id        uuid references public.tracks(id) on delete set null,
  card_idx        int  not null,
  guess_year      int  not null,
  truth_year      int  not null,
  delta           int  not null,
  base            int  not null,
  multiplier      int  not null,
  points          int  not null,
  era             era  not null,
  correct         boolean not null,
  played_at       timestamptz not null default now()
);

create index if not exists placements_game_idx on public.placements (game_id, card_idx);

alter table public.placements enable row level security;

drop policy if exists "placements: read by host"   on public.placements;
drop policy if exists "placements: insert by host" on public.placements;

create policy "placements: read by host"
  on public.placements for select
  to authenticated
  using (
    exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

create policy "placements: insert by host"
  on public.placements for insert
  to authenticated
  with check (
    exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

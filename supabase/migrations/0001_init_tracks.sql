-- ============================================
-- YILLAR · 0001 — Tracks table (catalog of songs)
-- ============================================
-- Каталог треков для угадайки. Только чтение клиентам.
-- Запись/изменение — через сервисный ключ (admin).

create extension if not exists "pgcrypto";

create type era as enum ('klassika', 'kasseta', 'tsifra');

create table if not exists public.tracks (
  id          uuid primary key default gen_random_uuid(),
  youtube_id  text not null,
  artist      text not null,
  title       text not null,
  year        smallint not null check (year between 1900 and 2100),
  era         era not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),

  unique (youtube_id)
);

create index if not exists tracks_active_idx on public.tracks (active) where active;
create index if not exists tracks_era_year_idx on public.tracks (era, year);

alter table public.tracks enable row level security;

-- Все могут читать активные треки (включая анонимных пользователей)
create policy "tracks: public read active"
  on public.tracks
  for select
  using (active = true);

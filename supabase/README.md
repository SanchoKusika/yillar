# Supabase — YILLAR

## Этап 4 — каталог треков

### Применить миграцию

В Supabase Studio:

1. SQL Editor → New query → вставить содержимое `migrations/0001_init_tracks.sql` → Run
2. SQL Editor → New query → вставить содержимое `seed.sql` → Run

## Этап 5 — аккаунты + история партий

### Применить миграцию

1. SQL Editor → New query → вставить содержимое `migrations/0002_auth_history.sql` → Run

### Включить Anonymous sign-in

1. **Authentication → Providers → Anonymous Sign-Ins** → переключить **Enable** → Save
2. **Authentication → Providers → Email** → проверить что включено (по умолчанию on)
3. (Опционально) **Authentication → Email Templates** → отредактировать «Confirm signup»

### Что появляется

- `profiles` — расширение `auth.users` (username, display_name, generation, avatar)
- `games` — заголовок партии (host, status, started/ended)
- `game_players` — участники (хост по user_id, остальные по guest_name)
- `placements` — каждый ход (track, guess/truth, delta, points, era)
- Триггер `on_auth_user_created` — автоматически создаёт пустой profile для каждого нового user
- RLS: хост может читать/писать все строки своих партий; чужие игры недоступны

### Локальные переменные окружения

Создайте `.env.local` в корне проекта:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

URL и anon key — в Supabase Studio → Settings → API.

Если переменные не заданы, приложение автоматически использует `DEMO_TRACKS` —
можно разрабатывать UI без Supabase.

# YILLAR · The Game of Years

### Советский конструктивизм × узбекский жирих · Угадай год выхода песни

---

## О проекте

**YILLAR** (узб. «Годы») — мобильная музыкальная викторина: звучит отрывок песни, игрок перетаскивает указатель на временно́й шкале и угадывает год выхода трека. Чем точнее — тем больше очков. Если угадал песню из своей эпохи — ×3 бонус. Идеальное угадывание — +20 к счёту.

Два режима игры:
- **Pass & Play** — на одном устройстве, 2–4 игрока
- **Online** — синхронный мультиплеер через Supabase Realtime, каждый на своём устройстве

---

## Стек технологий

| Слой            | Технологии                                      |
| --------------- | ----------------------------------------------- |
| Фронтенд        | React 18 · TypeScript · Vite 5                  |
| Стили           | Tailwind CSS v4 (`@theme` токены) · CSS Modules |
| Хранилище       | Zustand + localStorage persist                  |
| Сервер          | Supabase (PostgreSQL · Realtime · RLS · Storage) |
| Запросы         | TanStack Query (React Query v5)                 |
| Аудио           | YouTube IFrame API                              |
| PWA             | vite-plugin-pwa · Workbox                       |
| Нативные (план) | Capacitor (iOS / Android)                       |
| Локализация     | Самодельный i18n: RU · UZ · EN                  |
| Темы            | `data-theme="dark/light"` · CSS переменные      |

---

## Архитектура

Проект построен по **Feature-Sliced Design (FSD)**:

```
src/
├── app/            # Роутер, провайдеры, глобальные стили
├── pages/          # home · lobby · game · reveal · end
│                   # online · auth · profile · reset-password
├── widgets/        # audio-strip · player-roster · song-card
│                   # timeline · scoreboard-bar · bottom-nav · pwa-prompt
├── features/       # save-game
├── entities/       # game · player · placement · track · room
│                   # session · game-history · preferences
└── shared/         # ui · lib (i18n, scoring, era) · api · config · assets
```

---

## Игровая механика

### Очки

| Ситуация        | Формула                                       |
| --------------- | --------------------------------------------- |
| Базовые очки    | `MAX(0, 10 − \|guess − truth\|)`              |
| Множитель эпохи | `× 3` если эпоха трека = эпоха игрока         |
| Бонус идеала    | `+20` если угадал точный год                  |

Пример: точное попадание в свою эпоху = **10 × 3 + 20 = 50**. Промах на 5 лет без бонуса эпохи = **5**.  
Правильным считается ответ в пределах ±5 лет (`correct = delta ≤ 5`).

### Эпохи

| Код        | Название           | Годы      |
| ---------- | ------------------ | --------- |
| `klassika` | КЛАССИКА / CLASSIC | 1960–1989 |
| `kasseta`  | КАССЕТА / CASSETTE | 1990–1999 |
| `tsifra`   | ЦИФРА / DIGITAL    | 2000+     |

---

## Быстрый старт

```bash
npm install
npm run dev    # localhost:5173
npm run build  # tsc -b && vite build
```

### Переменные окружения

Скопируй `.env.example` → `.env.local` и заполни:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Без Supabase-ключей приложение запускается в **DEMO MODE** — без сохранения истории, авторизации и онлайн-режима.

---

## Экраны

```
/                        Главная — выбор режима (Pass & Play / Online)
/lobby                   Pass & Play лобби — состав игроков, выбор эпохи
/game                    Игровой экран — карточка, аудиополоска, шкала
/reveal                  Результат хода — Standard / Perfect / Rejected
/end                     Итоги партии — победитель, разбивка по игрокам

/online                  Online — создать комнату / войти по коду
/online/room/:code       Ожидание — список игроков, имя, эпоха, старт
/online/game/:code       Online-ход — 60 с таймер, авто-сабмит
/online/reveal/:code/:i  Online-ревил — результаты раунда + нарастающий итог
/online/end/:code        Online-финал — лидерборд, рематч

/auth                    Вход / регистрация / гостевой режим
/profile                 Профиль — статы, история, настройки
```

---

## База данных (Supabase)

```
tracks          id · title · artist · era · year · youtube_id
profiles        id · display_name · avatar_url
games           id · host_id · total_cards · started_at
game_players    id · game_id · display_name · generation · rank · is_winner
placements      id · game_player_id · track_id · guess · truth · delta
                · correct · points · bonus · skipped · era

rooms           id · code · host_id · status · track_ids · current_track_idx
room_players    id · room_id · player_id · name · era · is_host
room_guesses    id · room_id · track_idx · player_id · guess_year
```

Migrations: `supabase/migrations/`. Применять через Supabase MCP или `supabase db push`.

---

## Локализация

Переводы: `src/shared/lib/i18n/translations.ts`  
Хук: `useT()` — возвращает `t(key, params?)` с подстановкой `{n}`  
Язык хранится в Zustand `usePreferencesStore` → localStorage `yillar.preferences`

---

## Дизайн-система

- **Цвет** — `--color-ink` / `--color-cream` / `--color-gold` + токены по эпохам (`--color-klassika-primary` и т.д.)
- **Светлая тема** — переопределение через `[data-theme="light"]` на `<html>`
- **Шрифты** — Open Sans (condensed/semi-condensed), Playfair Display, IBM Plex Mono
- **Орнамент** — 16-лучевая гирих-звезда SVG + PaperGrain текстура

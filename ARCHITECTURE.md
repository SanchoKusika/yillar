# YILLAR — Подробное описание проекта

> Документ охватывает архитектуру, потоки данных, механику, компонентную модель и технические решения.  
> Целевая аудитория: разработчик, впервые открывший проект, или автор после долгого перерыва.

---

## Содержание

1. [Концепция и механика](#1-концепция-и-механика)
2. [Стек и зависимости](#2-стек-и-зависимости)
3. [Структура директорий (FSD)](#3-структура-директорий-fsd)
4. [Слой `shared`](#4-слой-shared)
5. [Слой `entities`](#5-слой-entities)
6. [Слой `features`](#6-слой-features)
7. [Слой `widgets`](#7-слой-widgets)
8. [Слой `pages`](#8-слой-pages)
9. [Слой `app`](#9-слой-app)
10. [База данных Supabase](#10-база-данных-supabase)
11. [Авторизация и сессия](#11-авторизация-и-сессия)
12. [Система очков](#12-система-очков)
13. [Аудио: YouTube IFrame API](#13-аудио-youtube-iframe-api)
14. [PWA и Service Worker](#14-pwa-и-service-worker)
15. [Темы и дизайн-система](#15-темы-и-дизайн-система)
16. [Локализация (i18n)](#16-локализация-i18n)
17. [Настройки пользователя](#17-настройки-пользователя)
18. [Поток данных: полная партия](#18-поток-данных-полная-партия)
19. [Ключевые технические решения](#19-ключевые-технические-решения)

---

## 1. Концепция и механика

**YILLAR** (узб. «Годы») — мобильная музыкальная викторина в стиле советского конструктивизма с визуальным языком узбекского орнамента **гирих**.

### Игровой процесс

1. На главном экране регистрируются **2–4 игрока** (имя + выбор эпохи-поколения).
2. Из базы загружается **12 случайных треков** (по умолчанию).
3. Ходы идут по кругу: каждый игрок видит **карточку** с названием и исполнителем, слышит отрывок, перемещает **ползунок** на шкале 1960–2025 и нажимает **ЗАФИКСИРОВАТЬ**.
4. Открывается **экран результата** (RevealStandard / RevealPerfect / RevealRejected).
5. После последней карточки — **экран итогов** с рейтингом и разбивкой по эпохам.
6. Партия автоматически сохраняется в Supabase для авторизованных пользователей.

### Карточка песни

Карточка **намеренно не раскрывает эпоху**: нет цветовой подсветки, нет маркировки. Только название, исполнитель, порядковый номер и чёрные redact-полосы поверх года.

### Пропуск хода

Если игрок нажимает **ПРОПУСК** — создаётся `Placement` с `skipped: true, points: 0`, отображается экран RevealRejected.

---

## 2. Стек и зависимости

| Пакет                   | Версия | Назначение                        |
| ----------------------- | ------ | --------------------------------- |
| `react`                 | 18     | UI                                |
| `react-router-dom`      | 6      | SPA-роутинг                       |
| `typescript`            | 5      | Типизация                         |
| `vite`                  | 5      | Сборщик                           |
| `@vitejs/plugin-react`  | —      | Fast Refresh                      |
| `tailwindcss`           | v4     | Утилиты + CSS токены (`@theme`)   |
| `@tailwindcss/vite`     | —      | Плагин Tailwind v4 для Vite       |
| `zustand`               | 4      | Глобальное состояние              |
| `@tanstack/react-query` | 5      | Серверные запросы + кэш           |
| `@supabase/supabase-js` | 2      | Auth, DB, Storage                 |
| `vite-plugin-pwa`       | —      | Service Worker + Web App Manifest |
| `workbox-*`             | —      | Стратегии кэширования SW          |

---

## 3. Структура директорий (FSD)

Архитектурный стандарт **Feature-Sliced Design**: импорты идут только вниз по слоям (`app` → `pages` → `widgets` → `features` → `entities` → `shared`). Каждый слой разбит на **срезы** (слайсы), каждый срез имеет публичный API через `index.ts`.

```
src/
├── app/
│   ├── main.tsx               — точка входа, монтирование React
│   ├── App.tsx                — дерево провайдеров
│   ├── providers/             — Router, Query, Session, Theme
│   └── styles/index.css       — @theme токены, шрифты, глобальные утилиты
│
├── pages/
│   ├── home/                  — лобби: состав, старт
│   ├── game/                  — игровой экран
│   ├── reveal/                — Standard / Perfect / Rejected
│   ├── end/                   — итоги партии
│   ├── auth/                  — вход / регистрация / гость
│   └── profile/               — статы, история, друзья, настройки
│
├── widgets/
│   ├── audio-strip/           — VU-плеер с прогресс-баром
│   ├── bottom-nav/            — нижняя навигация
│   ├── player-roster/         — регистрация игроков
│   ├── pwa-prompt/            — баннер обновления / toast офлайн
│   ├── scoreboard-bar/        — шапка с очками текущего хода
│   ├── song-card/             — карточка трека (era-neutral)
│   └── timeline/              — шкала с размещёнными карточками + ползунок
│
├── features/
│   └── save-game/             — мутация TanStack Query → saveGame()
│
├── entities/
│   ├── game/                  — useGameStore (Zustand), селекторы
│   ├── game-history/          — fetchHistory, fetchStats, хуки
│   ├── placement/             — тип Placement
│   ├── player/                — тип Player
│   ├── preferences/           — usePreferencesStore (тема, язык)
│   ├── session/               — useSessionStore, auth API
│   └── track/                 — тип Track, useTracks (запрос к Supabase)
│
└── shared/
    ├── api/                   — supabaseClient (singleton)
    ├── assets/                — шрифты, SVG (girih, grain, star-mark…)
    ├── config/                — env.ts (VITE_SUPABASE_*)
    ├── lib/                   — era, scoring, i18n, useYouTubeAudio, …
    └── ui/                    — CatalogLine, EraTag, GirihOverlay,
                                  PhoneFrame, PaperGrain, Wordmark, YButton, …
```

---

## 4. Слой `shared`

### `shared/config/env.ts`

Читает `import.meta.env.VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.  
Экспортирует `env.hasSupabase: boolean` — флаг демо-режима.

### `shared/api/supabaseClient.ts`

Создаёт **один экземпляр** `SupabaseClient` (или `null` в демо-режиме):

```ts
export const supabase = init(); // SupabaseClient | null
```

Все запросы к базе начинаются с проверки `if (!supabase) return ...`.

### `shared/lib/era.ts`

```ts
export type Era = "klassika" | "kasseta" | "tsifra";
export const ERAS: readonly Era[];
export const ERA_LABEL: Record<Era, string>; // "1960–89" и т.д.
export function eraForYear(year: number): Era;
export const eraVar = (era, key) => `var(--color-${era}-${key})`;
```

### `shared/lib/scoring.ts`

Вся математика очков сосредоточена здесь. Детали — в разделе 12.

### `shared/lib/useYouTubeAudio.tsx`

React-хук над YouTube IFrame API. Детали — в разделе 13.

### `shared/lib/i18n/`

Самодельная система локализации. Детали — в разделе 16.

### `shared/ui/`

Набор headless / branding-компонентов:

| Компонент      | Назначение                                               |
| -------------- | -------------------------------------------------------- |
| `PhoneFrame`   | Обёртка 390×844 с центровкой — имитирует мобильный       |
| `YButton`      | Кнопка в трёх вариантах: default, ghost, era             |
| `CatalogLine`  | Строка `left ··· right` в стиле каталожной записи        |
| `EraTag`       | Бейдж эпохи с цветом `primary` соответствующей эпохи     |
| `GirihOverlay` | 16-лучевая гирих-звезда SVG, абсолютно позиционированная |
| `PaperGrain`   | SVG-текстура «бумажного зерна» поверх блока              |
| `Wordmark`     | Логотип YILLAR в SVG                                     |
| `Multiplier`   | Отображение множителя ×1 / ×3                            |
| `GoldRule`     | Горизонтальный разделитель цвета gold                    |

---

## 5. Слой `entities`

### `entities/game` — главное состояние игры

**Zustand-стор** `useGameStore`. Не персистируется (сбрасывается при перезагрузке).

```ts
type State = {
	players: Player[]; // 4 слота, пустые имена = неактивные
	tracks: Track[]; // карточки текущей партии
	totalCards: number;
	currentCardIdx: number;
	currentPlayerIdx: number;
	status: "lobby" | "playing" | "reveal" | "ended";
	currentGuess: number | null;
	placements: Record<playerId, Placement[]>;
	scores: Record<playerId, number>;
	savedGameId: string | null;
	saveStarted: boolean; // флаг дедупликации сохранения
};
```

**Ключевые экшены:**

- `startGame(tracks)` — переход lobby → playing, инициализация placements/scores
- `lockIn()` → вызывает `calcScore`, создаёт Placement, переход → reveal
- `skipTurn()` → Placement с `skipped: true`, переход → reveal
- `advanceTurn()` → следующий игрок по кругу или `status: "ended"`
- `beginSave()` — атомарный guard, возвращает `false` если сохранение уже запущено

**Селекторы (хуки):**

```ts
useActivePlayers(); // players.filter(p => p.name && p.era)
useCurrentPlayer(); // players[currentPlayerIdx]
useCurrentTrack(); // tracks[currentCardIdx]
useMyPlacements(); // placements[currentPlayer.id]
```

### `entities/session`

Zustand-стор `useSessionStore` хранит:

```ts
user: AuthUserSummary | null; // { id, email, isAnonymous }
profile: Profile | null; // { displayName, generation, avatarUrl, … }
loading: boolean;
```

Заполняется через `SessionProvider` при монтировании.

### `entities/preferences`

Zustand с `persist` middleware → `localStorage["yillar.preferences"]`:

```ts
{ theme: "dark" | "light", language: "ru" | "uz" | "en" }
```

Язык при первом запуске определяется из `navigator.language`.

### `entities/track`

```ts
type Track = {
	id: string;
	title: string;
	artist: string;
	era: Era;
	year: number;
	youtubeId: string;
};
```

Хук `useTracks(limit)` — TanStack Query запрос к `supabase.from("tracks").limit(limit)` с рандомизацией через `order("id", { ascending: false })`.

### `entities/placement`

```ts
type Placement = {
	trackId: string;
	guess: number;
	truth: number;
	delta: number; // |guess - truth|
	base: number; // очки до множителя
	multiplier: number; // 1 или 3
	bonus: number; // 20 при delta === 0, иначе 0
	points: number; // итого: base * multiplier + bonus
	era: Era;
	title: string;
	correct: boolean; // delta <= 5
	skipped?: boolean;
};
```

### `entities/game-history`

Два TanStack Query хука:

- `useHistory(userId, limit)` — последние N партий хоста
- `useProfileStats(userId)` — агрегаты: `gamesPlayed`, `bestScore`, `averageScore`, `wins`, `eraBreakdown[]`, `bestDecade`

`eraBreakdown` считает **уникальные угаданные треки** (Set по `track_id`) — не количество верных ходов.

---

## 6. Слой `features`

### `features/save-game`

`useSaveGame()` — обёртка `useMutation` над `saveGame(input)`.

Функция `saveGame`:

1. INSERT в `games` → получает `gameId`
2. Для каждого игрока — INSERT в `game_players` → получает `gamePlayerId`
3. Для каждого placement — batch INSERT в `placements`

Сохранение запускается на экране EndPage через `useEffect` с guard `beginSave()` (однократно, несмотря на ре-рендеры).

---

## 7. Слой `widgets`

### `widgets/audio-strip`

Отображает кастомный плеер поверх `useYouTubeAudio`:

- 10 анимированных баров VU-метра (4 варианта keyframe: `eq-a/b/c/d`, случайные длительности 0.48–1.12s, отрицательные задержки для органичного рассинхрона)
- Прогресс-бар с маркерами 25%/50%/75%
- Красный LED-индикатор (мигает при воспроизведении)
- Кнопка play/pause с SVG-иконками

### `widgets/song-card`

Отображает карточку трека в стиле «архивного дела»:

- `DOSSIER · ON FILE` + `CASE № xx/yy`
- Название трека, исполнитель
- Redact-полосы + `CLASSIFIED · YEAR`
- Намеренно **era-neutral**: фон `var(--color-paper)`, жёсткий цвет текста `#1A1208` (не инвертируется в светлой теме), тени `rgba(26,18,8,…)`

### `widgets/timeline`

Горизонтальная шкала игрока:

- Уже размещённые карточки (с цветовой рамкой: `primary` = правильно, `danger` = ошибка)
- «Drop zone» с текущим годом-догадкой
- `<input type="range" min=1960 max=2025>` — ползунок
- Метки декад (1960, 1970, … 2020)

### `widgets/player-roster`

Форма регистрации 4 игроков:

- Текстовые поля для имён (до 12 символов, UPPERCASE)
- Игрок 0 «заблокирован» если пользователь авторизован (имя берётся из профиля)
- Кнопки-переключатели эпох (EraToggle) с цветом соответствующей эпохи

### `widgets/scoreboard-bar`

Верхняя шапка игрового экрана:

- Текущий игрок (`game.turn · ИМЯИГРОКА`)
- Прогресс (`CARD 03 / 12`)
- Мини-таблица очков всех игроков с подсветкой активного хода

### `widgets/bottom-nav`

Нижняя навигация (NavLink из react-router-dom):

- Всегда: ГЛАВНАЯ, ПРОФИЛЬ
- Только для анонимных: ВХОД
- Активная вкладка подчёркивается золотой полосой

### `widgets/pwa-prompt`

- `needRefresh` → баннер «НОВАЯ ВЕРСИЯ ГОТОВА» + кнопка «ОБНОВИТЬ» (вызывает `updateServiceWorker(true)`)
- `offlineReady` → toast на 2.4 секунды «ГОТОВО К ОФЛАЙН-ИГРЕ»
- Использует `useRegisterSW` из `virtual:pwa-register/react`

---

## 8. Слой `pages`

### `pages/home` (HomePage)

- Монтирует `PlayerRoster` + `BottomNav`
- Если пользователь авторизован — блокирует слот 0 и заполняет его из `profile.displayName`
- Кнопка «СТАРТ» активна только когда: треки загружены + ≥2 игроков с именем + все с эпохой
- При старте: `startGame(tracks)` → navigate `/game`

### `pages/game` (GamePage)

- Читает текущую карточку и текущего игрока из `useGameStore`
- Монтирует: ScoreboardBar, SongCard, AudioStrip, Timeline
- Кнопки: ПРОПУСК (`skipTurn()`) и ЗАФИКСИРОВАТЬ (`lockIn()`) → оба navigate `/reveal`
- `<audio.PlayerHost />` — скрытый div для YouTube плеера

### `pages/reveal`

Роутер внутри страницы выбирает вариант по последнему placement:

```
RevealPage
  ├── RevealRejected  — skipped: true
  ├── RevealPerfect   — delta === 0
  └── RevealStandard  — всё остальное
```

Все три варианта используют **staged animations** через `useState<0|1|2|3>` + `setTimeout`.

**RevealStandard** — цвет фона и текста из эпохи трека (`eraVar`), анимированное раскрытие года (redact-bars → число), раскрытие множителя и разбивки очков.

**RevealPerfect** — чёрный фон, вращающаяся 16-лучевая гирих-звезда, пульсирующие концентрические кольца, flash-вспышка при появлении года.

**RevealRejected** — красный акцент, анимированный штамп ОТКЛОНЕНО/REJECTED, «FOR THE RECORD» с правильным годом.

После reveal: кнопка «СЛЕД. КАРТА · ИМЯ →» вызывает `advanceTurn()` и navigate `/game` (или `/end`).

### `pages/end` (EndPage)

- Рейтинг игроков (sorted by total desc)
- Победитель крупно + звёздочка + год / поколение
- ERA BREAKDOWN для каждого: 3 мини-гистограммы (klassika / kasseta / tsifra)
- Сохранение партии срабатывает один раз через `useEffect` + `beginSave()` guard
- Статус сохранения в строке CatalogLine (`● СОХРАНЯЕМ… → ● СОХРАНЕНО`)
- Кнопки: ПОДЕЛИТЬСЯ (заглушка) / ПОВТОР → (reset + navigate `/`)

### `pages/auth` (AuthPage)

- Tabs: ВХОД / РЕГИСТРАЦИЯ
- DEMO MODE: показывает заглушку без формы
- `signInWithEmail` → navigate `/`
- `signUpWithEmail` → confirmed (navigate `/`) или pending (показывает notice про email)
- `signInAnonymously` → navigate `/`

### `pages/profile` (ProfilePage)

Четыре вкладки:

**StatsTab** — ERA BREAKDOWN с прогресс-барами (уник. угадано / всего в каталоге), ЛУЧШИЕ ГОДЫ, ПОБЕД.

**HistoryTab** — список последних 10 партий: дата, количество игроков, место/победа, очки.

**FriendsTab** — заглушка «СКОРО».

**SettingsTab** — аватар (загрузка через Supabase Storage), имя, поколение, тема, язык, кнопка СОХРАНИТЬ, ВЫЙТИ / СОЗДАТЬ АККАУНТ.

---

## 9. Слой `app`

### Дерево провайдеров (`App.tsx`)

```
ThemeProvider
  └── QueryProvider (TanStack Query)
        └── RouterProvider (react-router)
              └── SessionProvider
                    └── <Outlet /> (страницы)
                          └── <PWAPrompt /> (всегда)
```

### `SessionProvider`

1. При монтировании: `supabase.auth.getSession()` (таймаут 6s)
2. Если сессии нет → `signInAnonymously()` (таймаут 8s)
3. `onAuthStateChange` подписка держится весь жизненный цикл
4. При каждом изменении сессии: `syncProfile(user)` — загружает или создаёт профиль

### `ThemeProvider`

Читает `usePreferencesStore().theme`, устанавливает `data-theme="light"` на `<html>` + `colorScheme`.

---

## 10. База данных Supabase

### Таблицы

```sql
tracks
  id            uuid PK
  title         text
  artist        text
  era           text ('klassika' | 'kasseta' | 'tsifra')
  year          integer
  youtube_id    text

profiles
  id            uuid FK → auth.users.id
  username      text UNIQUE
  display_name  text
  generation    text (Era | null)
  avatar_url    text

games
  id            uuid PK
  host_id       uuid FK → auth.users.id
  status        text ('ended')
  total_cards   integer
  started_at    timestamptz DEFAULT now()
  ended_at      timestamptz

game_players
  id            uuid PK
  game_id       uuid FK → games.id
  user_id       uuid FK → auth.users.id (null для гостей)
  guest_name    text
  display_name  text
  generation    text (Era)
  total_score   integer
  rank          integer
  is_winner     boolean

placements
  id            uuid PK
  game_id       uuid FK → games.id
  game_player_id uuid FK → game_players.id
  track_id      uuid FK → tracks.id (null если трек из демо)
  card_idx      integer
  guess_year    integer
  truth_year    integer
  delta         integer
  base          integer
  multiplier    integer
  points        integer
  era           text (Era)
  correct       boolean
```

### RLS-политики (принцип)

- `tracks` — SELECT для всех (анонимных тоже)
- `profiles` — SELECT/UPDATE только для `auth.uid() = id`
- `games` — INSERT/SELECT для `host_id = auth.uid()`
- `game_players` — INSERT через сервис, SELECT для участника
- `placements` — INSERT/SELECT привязан к `game_id` владельца

### Storage

Бакет `avatars`:

- Путь `{userId}/{timestamp}.{ext}`
- Публичный URL через `getPublicUrl`
- Политика: загрузка только для `auth.uid() = userId` из пути

---

## 11. Авторизация и сессия

### Сценарии пользователя

| Сценарий                  | Поведение                                             |
| ------------------------- | ----------------------------------------------------- |
| Первый визит без Supabase | DEMO MODE, `user = null`                              |
| Первый визит с Supabase   | автоматический `signInAnonymously()`                  |
| Гость                     | `isAnonymous: true`, история сохраняется по `user.id` |
| Зарегистрированный        | `isAnonymous: false`, профиль в `profiles`            |
| Повторный визит           | `getSession()` возвращает существующую сессию         |

### `syncProfile`

При каждом изменении `auth.users`:

1. `fetchProfile(userId)` — SELECT из `profiles`
2. Если профиль не найден → `ensureProfile(userId, displayName)` — INSERT
3. Если найден, но без `display_name`, и у пользователя есть `user_metadata.display_name` — пробует обновить
4. Результат → `useSessionStore.setProfile()`

---

## 12. Система очков

```ts
// src/shared/lib/scoring.ts

const MAX_BASE = 10;
const ERA_BONUS_MULTIPLIER = 3;
const EXACT_BONUS = 20;
const CORRECT_THRESHOLD_YEARS = 5;

function calcScore({ guess, truth, playerEra }): ScoreResult {
	const delta = Math.abs(truth - guess);
	const base = Math.max(0, MAX_BASE - delta);
	const trackEra = eraForYear(truth);
	const multiplier = trackEra === playerEra ? ERA_BONUS_MULTIPLIER : 1;
	const bonus = delta === 0 ? EXACT_BONUS : 0;
	return {
		delta,
		base,
		multiplier,
		bonus,
		points: base * multiplier + bonus,
	};
}
```

### Таблица результатов

| delta               | Своя эпоха           | Чужая эпоха          |
| ------------------- | -------------------- | -------------------- |
| 0 (идеально)        | 10 × 3 + 20 = **50** | 10 × 1 + 20 = **30** |
| 1                   | 9 × 3 = **27**       | 9 × 1 = **9**        |
| 5 (граница correct) | 5 × 3 = **15**       | 5 × 1 = **5**        |
| 10                  | 0 × 3 = **0**        | 0                    |
| >10                 | 0                    | 0                    |

`correct = delta <= 5` — используется для красной/зелёной рамки на шкале и статистики.

---

## 13. Аудио: YouTube IFrame API

### Архитектура

`useYouTubeAudio(videoId)` — React-хук. Принцип:

1. При монтировании: `loadYouTubeApi()` — загружает `youtube.com/iframe_api` (singleton, Promise)
2. Создаёт `YT.Player` внутри невидимого `<div ref={hostRef}>` (`position: absolute, left: -9999px, opacity: 0`)
3. `onReady` → `playerRef.current = e.target`
4. При смене `videoId` → `player.cueVideoById(videoId)` (не autoplay)
5. `isPlaying` синхронизируется через `onStateChange` (state=1 → playing, 0/2 → paused)
6. Прогресс полируется через `setInterval(250ms)` пока `isPlaying === true`

**Компонент `PlayerHost`** — мемоизированный функциональный компонент, монтирует скрытый div. Рендерится внутри `GamePage`: `<audio.PlayerHost />`.

### Почему IFrame, а не прямое аудио

YouTube не предоставляет прямые аудио-URL. IFrame API — единственный официальный способ воспроизведения с контролем через JS.

---

## 14. PWA и Service Worker

### Конфигурация (`vite.config.ts`)

```ts
VitePWA({
  registerType: "prompt",   // НЕ автообновление — пользователь выбирает
  manifest: {
    name: "YILLAR · The Game of Years",
    short_name: "YILLAR",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#D4A842",
    background_color: "#1A1208",
    // иконки: icon.svg, icon-maskable.svg, apple-touch-icon.svg
  },
  workbox: {
    runtimeCaching: [
      // Supabase REST API — StaleWhileRevalidate
      { urlPattern: /supabase\.co\/rest\/v1\/tracks/, ... },
      // Аватары — CacheFirst (30 дней)
      { urlPattern: /\/storage\/v1\/object\/public\/avatars\//, ... },
      // YouTube превью — CacheFirst (7 дней)
      { urlPattern: /i\.ytimg\.com/, ... },
    ],
  },
  devOptions: { enabled: true, type: "module" },
})
```

### Иконки

| Файл                          | Использование                         |
| ----------------------------- | ------------------------------------- |
| `public/icon.svg`             | Основная иконка PWA                   |
| `public/icon-maskable.svg`    | Android адаптивная иконка (safe zone) |
| `public/apple-touch-icon.svg` | iOS Safari «Добавить на экран»        |
| `public/favicon.svg`          | Tab favicon                           |

### `PWAPrompt` widget

При `needRefresh` — баннер с кнопкой обновить.  
При `offlineReady` — toast на 2.4s, затем скрывается.

---

## 15. Темы и дизайн-система

### CSS-токены (`src/app/styles/index.css`)

```css
@theme {
  --color-ink:      #1A1208;   /* основной фон */
  --color-ink-2:    #2A2010;
  --color-ink-3:    #3A3020;
  --color-cream:    #F0EEE9;   /* основной текст */
  --color-gold:     #D4A842;   /* акцент */
  --color-danger:   #C0392B;
  --color-paper:    #F5EFE0;   /* фон карточки */
  --color-paper-edge: rgba(26,18,8,0.18);

  /* Эпоха КЛАССИКА */
  --color-klassika-primary:   #C4A35A;
  --color-klassika-deep:      #2D1E0A;
  --color-klassika-surface:   #F5EAD0;
  ...

  /* Эпоха КАССЕТА */
  --color-kasseta-primary:    #7ECCC4;
  ...

  /* Эпоха ЦИФРА */
  --color-tsifra-primary:     #A87ECC;
  ...
}
```

### Светлая тема

```css
:root[data-theme="light"] {
  --color-ink:    #F0EEE9;
  --color-cream:  #1A1208;
  --color-paper:  #DDD6C5;
  ...
}
/* Подъём прозрачности чтобы контент не выцветал на светлом фоне */
:root[data-theme="light"] .opacity-40 { opacity: 0.78; }
:root[data-theme="light"] .opacity-50 { opacity: 0.82; }
/* … до opacity-90 */
```

Тема применяется через `data-theme="light"` на `<html>` — `ThemeProvider` следит за `usePreferencesStore`.

### Шрифты

| Семья                | Использование                                                   | Начертания       |
| -------------------- | --------------------------------------------------------------- | ---------------- |
| **Open Sans**        | Весь UI: condensed (заголовки, кнопки), semi-condensed, regular | 400–800 + italic |
| **Playfair Display** | `font-display` — крупные числа, год                             | 400–900          |
| **IBM Plex Mono**    | `font-mono` — метки, коды, статусы                              | 300–700          |

Все шрифты хранятся в `src/shared/assets/fonts/` и загружаются через `@font-face` без Google CDN (работает офлайн).

---

## 16. Локализация (i18n)

### Структура

```
src/shared/lib/i18n/
  translations.ts   — словари ru / uz / en, тип TranslationKey
  index.ts          — функция t(), хук useT()
```

### API

```ts
// Функция (для не-React контекстов)
t(key: TranslationKey, lang: Language, params?: Record<string, string|number>): string

// Хук (в React-компонентах)
const t = useT();
t("game.lockIn", { year: 1987 })  // → "ЗАФИКСИРОВАТЬ · 1987 →"
```

Подстановка: `{n}` заменяется значением из `params`.

### Охват

Все пользовательские строки переведены: кнопки, заголовки, CatalogLine, статусы, баннеры, названия эпох, навигация, ERA BREAKDOWN, декады, игровые экраны. Не переводятся: названия треков, исполнители, коды эпох в БД.

### Автодетекция языка

```ts
const code = navigator.language?.slice(0, 2).toLowerCase();
if (code === "uz") return "uz";
if (code === "en") return "en";
return "ru"; // дефолт
```

---

## 17. Настройки пользователя

`usePreferencesStore` (Zustand + persist → localStorage `yillar.preferences`):

```ts
{ theme: "dark" | "light", language: "ru" | "uz" | "en" }
```

Применяются мгновенно через реактивные подписки без перезагрузки страницы.

---

## 18. Поток данных: полная партия

```
[HomeScreen]
  useTracks(12)              → Supabase → 12 треков
  players[0..3]              ← PlayerRoster (имена + эпохи)
  startGame(tracks)          → useGameStore

[GamePage] × (totalCards × activePlayers)
  currentTrack               ← useCurrentTrack()
  useYouTubeAudio(ytId)      → YouTube IFrame API
  guessYear                  ← Timeline slider → setGuess()
  lockIn() / skipTurn()      → placement + navigate /reveal

[RevealPage]
  last placement             ← useGameStore
  → RevealPerfect | RevealStandard | RevealRejected
  advanceTurn()              → navigate /game или /end

[EndPage]
  placements, scores         ← useGameStore
  ranked = activePlayers.sort(score desc)
  saveGame(input)            → Supabase (games + game_players + placements)
  onReplay()                 → reset() + navigate /

[ProfilePage]
  useProfileStats(userId)    → Supabase (game_players + placements + tracks)
  useHistory(userId, 10)     → Supabase (games + game_players)
```

---

## 19. Ключевые технические решения

### Guard `beginSave()`

EndPage рендерится несколько раз из-за зависимостей `useEffect`. Guard предотвращает двойное сохранение:

```ts
beginSave: () => {
  if (get().saveStarted) return false;
  set({ saveStarted: true });
  return true;
},
```

### `--color-paper` для SongCard

Карточка не должна инвертироваться в светлой теме (тёмный текст на бежевом фоне в обоих режимах). Решение: отдельный токен `--color-paper` / `--color-paper-edge` + хардкод `color: #1A1208` для текста.

### YouTube Player в hidden div

YouTube требует DOM-элемент для монтирования плеера. Элемент скрыт через абсолютное позиционирование за пределами экрана (`left: -9999px`), а не через `display:none` — SDK не инициализируется в скрытых элементах.

### Органичная VU-метр анимация

10 баров с 4 вариантами keyframe (`eq-a/b/c/d`), индивидуальные `animationDuration` (0.48–1.12s) и `animationDelay` (отрицательные, для смещения фазы). Это создаёт ощущение живого движения без синхронизации.

### `TranslationKey` как union type

TypeScript проверяет ключи переводов на этапе компиляции. Если ключ не существует — ошибка сборки. Это исключает опечатки в ключах и гарантирует покрытие всех трёх языков.

### Статистика: уникальные треки, а не ходы

`eraBreakdown.correct` — размер `Set<track_id>` по верным ходам, не счётчик. Это честнее: одна и та же песня в нескольких партиях считается один раз.

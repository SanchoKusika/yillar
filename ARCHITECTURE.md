# YILLAR — Подробное описание проекта (Mobile / chore/mobile)

> Документ охватывает архитектуру, потоки данных, механику, компонентную модель и технические решения.  
> Целевая аудитория: разработчик, впервые открывший проект, или автор после долгого перерыва.
>
> **Ветки:** `chore/mobile` — React Native + Expo SDK 56 (Android). Веб-версия (React + Vite + PWA) на ветке `dev`. Общий Supabase-бэкенд.

---

## Содержание

1. [Концепция и механика](#1-концепция-и-механика)
2. [Стек и зависимости](#2-стек-и-зависимости)
3. [Структура директорий (FSD + expo-router)](#3-структура-директорий-fsd--expo-router)
4. [Слой `shared`](#4-слой-shared)
5. [Слой `entities`](#5-слой-entities)
6. [Слой `features`](#6-слой-features)
7. [Маршруты (`app/`)](#7-маршруты-app)
8. [Root layout (`app/_layout.tsx`)](#8-root-layout-app_layouttsx)
9. [База данных Supabase](#9-база-данных-supabase)
10. [Авторизация и сессия](#10-авторизация-и-сессия)
11. [Система очков](#11-система-очков)
12. [Аудио: react-native-youtube-iframe](#12-аудио-react-native-youtube-iframe)
13. [Темы и дизайн-система](#13-темы-и-дизайн-система)
14. [Локализация (i18n)](#14-локализация-i18n)
15. [Настройки пользователя](#15-настройки-пользователя)
16. [Поток данных: полная партия](#16-поток-данных-полная-партия)
17. [Ключевые технические решения](#17-ключевые-технические-решения)
18. [Сборка: EAS Build](#18-сборка-eas-build)

---

## 1. Концепция и механика

**YILLAR** (узб. «Годы») — мобильная музыкальная викторина в стиле советского конструктивизма с визуальным языком узбекского орнамента **гирих**.

### Режимы игры

**Pass & Play** — на одном устройстве, 2–4 игрока ходят по кругу.

**Online** — синхронный мультиплеер. Каждый на своём устройстве, ходы одновременные (60 секунд на тур), результаты видны всем в реальном времени через Supabase Realtime.

### Игровой процесс (Pass & Play)

1. На главном экране выбирают режим. В лобби регистрируются **2–4 игрока** (имя + эпоха).
2. Из базы загружается **12 случайных треков**.
3. Ходы идут по кругу: игрок видит **карточку**, слышит отрывок, перемещает **ползунок** на шкале 1960–2025 и нажимает **ЗАФИКСИРОВАТЬ**.
4. Открывается **экран результата** (RevealStandard / RevealPerfect / RevealRejected).
5. После последней карточки — **экран итогов** с рейтингом и разбивкой по эпохам.
6. Партия автоматически сохраняется в Supabase для авторизованных пользователей.

### Игровой процесс (Online)

1. Хост создаёт комнату → получает 4-символьный код. Остальные вводят код.
2. В **WaitingRoom** все задают имя + эпоху. Хост нажимает старт.
3. На каждом треке все угадывают **одновременно**. Таймер 60 с — по истечении авто-сабмит.
4. После сабмита всех игроков — **OnlineReveal** с таблицей очков за раунд и нарастающим итогом.
5. Хост нажимает «следующий трек». После последнего — **OnlineEnd** с итоговым лидербордом.
6. Хост может нажать **ЕЩЁ РАЗ** — комната сбрасывается (`resetRoom`), все возвращаются в WaitingRoom.

### Карточка песни

Карточка **намеренно не раскрывает эпоху**: нет цветовой подсветки, нет маркировки. Только название, исполнитель, порядковый номер и чёрные redact-полосы поверх года.

### Пропуск хода

Если игрок нажимает **ПРОПУСК** — создаётся `Placement` с `skipped: true, points: 0`, отображается экран RevealRejected.

---

## 2. Стек и зависимости

| Пакет                                       | Версия    | Назначение                                     |
| ------------------------------------------- | --------- | ---------------------------------------------- |
| `expo`                                      | ~56.0     | SDK, build toolchain                           |
| `expo-router`                               | latest    | File-based navigation + deep links             |
| `react-native`                              | 0.85      | Нативный UI                                    |
| `react`                                     | 19.2      | UI                                             |
| `typescript`                                | ~5.6      | Типизация                                      |
| `zustand`                                   | ^5        | Глобальное состояние                           |
| `@tanstack/react-query`                     | ^5        | Серверные запросы + кэш                        |
| `@supabase/supabase-js`                     | ^2        | Auth, DB, Realtime, Storage                    |
| `@react-native-async-storage/async-storage` | latest    | Persist storage для Zustand                    |
| `react-native-youtube-iframe`               | ^2.3      | YouTube WebView-плеер                          |
| `react-native-reanimated`                   | v4        | Анимации (EQ-волны, staged reveals)            |
| `react-native-svg` + `svg-transformer`      | latest    | SVG как React-компоненты                       |
| `react-native-gesture-handler`              | latest    | GestureHandlerRootView (обязателен для Reanimated) |
| `react-native-safe-area-context`            | latest    | SafeAreaProvider / SafeAreaView                |
| `react-native-screens`                      | latest    | Ускорение навигационных переходов              |
| `@react-native-community/slider`            | latest    | Timeline ползунок                              |
| `expo-font`                                 | latest    | Загрузка шрифтов                               |
| `expo-splash-screen`                        | latest    | Управление splash screen                       |
| `expo-status-bar`                           | latest    | Стиль системного статус-бара                   |
| `expo-haptics`                              | latest    | Тактильная отдача                              |
| `expo-clipboard`                            | latest    | Копирование кода комнаты                       |
| `expo-sharing`                              | latest    | Share sheet (итоги партии)                     |
| `expo-localization`                         | latest    | Автодетекция языка системы                     |
| `expo-linking`                              | latest    | Deep link обработка                            |
| `@expo-google-fonts/playfair-display`       | latest    | Playfair Display (все начертания)              |
| `@expo-google-fonts/ibm-plex-mono`          | latest    | IBM Plex Mono (все начертания)                 |

---

## 3. Структура директорий (FSD + expo-router)

```
yillar/
├── app/                          ← expo-router маршруты
│   ├── _layout.tsx               — root layout: шрифты, провайдеры, SplashScreen
│   ├── index.tsx                 — HomePage
│   ├── lobby.tsx                 — Pass & Play лобби
│   ├── game.tsx                  — игровой экран
│   ├── reveal.tsx                — результат хода
│   ├── end.tsx                   — итоги партии
│   ├── auth.tsx                  — вход / регистрация / гость
│   ├── profile.tsx               — профиль, настройки
│   ├── reset-password.tsx        — смена пароля (deep link)
│   └── online/
│       ├── index.tsx             — создать / войти в комнату
│       ├── room/[code].tsx       — ожидание: имя, эпоха, старт
│       ├── game/[code].tsx       — online-ход (60 с таймер)
│       ├── reveal/[code]/[idx].tsx — результат раунда
│       └── end/[code].tsx        — финал, рематч
│
├── src/
│   ├── shared/
│   │   ├── api/                  — supabaseClient (AsyncStorage adapter)
│   │   ├── config/               — env.ts (EXPO_PUBLIC_*)
│   │   ├── lib/                  — era · scoring · i18n · haptic · share
│   │   │                           sessionStore · formatTime · useYouTubeAudio
│   │   ├── ui/                   — PhoneFrame · Wordmark · YButton · EraSelect
│   │   │                           TextInput · Banner · FieldLabel · CatalogLine
│   │   │                           GirihOverlay · PaperGrain · GoldRule · Multiplier
│   │   │                           SectionHeader · EraTag · NavIcons
│   │   ├── providers/            — QueryProvider · SessionProvider
│   │   └── assets/
│   │       ├── fonts/            — Open Sans TTF (все начертания)
│   │       └── svg/              — girih-tile · paper-grain · star-mark · nav-icons · flags
│   │
│   ├── entities/
│   │   ├── game/                 — useGameStore (Zustand), селекторы
│   │   ├── game-history/         — fetchStats, useProfileStats
│   │   ├── placement/            — тип Placement
│   │   ├── preferences/          — usePreferencesStore (тема, язык → AsyncStorage)
│   │   ├── room/                 — roomsApi, useRoom/Players/Guesses (Realtime)
│   │   ├── session/              — useSessionStore, sessionApi
│   │   └── track/                — тип Track, getTracks, getTrackById
│   │
│   ├── features/
│   │   ├── game/                 — SongCard · AudioStrip · Timeline · ScoreboardBar
│   │   ├── lobby/                — PlayerRoster
│   │   ├── navigation/           — BottomNav
│   │   ├── reveal/               — RevealStandard · RevealPerfect · RevealRejected
│   │   └── save-game/            — saveGame API
│   │
│   └── theme/
│       ├── tokens.ts             — DARK_COLORS · LIGHT_COLORS · ERA_COLORS
│       │                           fonts · fontSizes · tracking() · leading()
│       ├── ThemeProvider.tsx     — React Context (dark/light)
│       └── useTheme.ts
│
├── assets/
│   ├── icon.png                  — 1024×1024 app icon
│   ├── adaptive-icon.png         — 1024×1024 Android adaptive icon foreground
│   ├── splash.png                — 1080×1920 splash screen
│   └── fonts/                    — (зарезервировано; основные шрифты в src/shared/assets)
│
├── scripts/
│   └── gen-assets.mjs            — генерация placeholder PNG-иконок
│
├── supabase/migrations/          — SQL-миграции (общие с web)
│
├── app.json                      — Expo config
├── babel.config.js               — reanimated plugin + module-resolver (алиасы)
├── metro.config.js               — SVG transformer + unstable_enablePackageExports:false
├── eas.json                      — EAS Build профили
└── tsconfig.json                 — paths для алиасов
```

---

## 4. Слой `shared`

### `shared/config/env.ts`

Читает `process.env.EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_SUPABASE_ANON_KEY`.  
Экспортирует `env.hasSupabase: boolean` — флаг демо-режима.

### `shared/api/supabaseClient.ts`

Создаёт **один экземпляр** `SupabaseClient` (или `null` в демо-режиме), с `AsyncStorage` в качестве хранилища сессии:

```ts
export const supabase = init(); // SupabaseClient | null
```

### `shared/lib/era.ts`

```ts
export type Era = "klassika" | "kasseta" | "tsifra";
export const ERAS: readonly Era[];
export const ERA_LABEL: Record<Era, string>;   // "1960–89" и т.д.
export function eraForYear(year: number): Era;
export const eraColor = (era: Era, key: EraKey): string; // hex из палитры
```

`eraColor` заменяет веб-версию `eraVar()` (которая возвращала `var(--color-…)`).

### `shared/lib/scoring.ts`

Вся математика очков сосредоточена здесь. Детали — в разделе 11.

### `shared/lib/useYouTubeAudio.tsx`

React-хук над `react-native-youtube-iframe`. Детали — в разделе 12.

### `shared/lib/sessionStore.ts`

In-memory Map, заменяющий веб-`sessionStorage` для передачи данных между экранами внутри одной сессии (накопленные очки из OnlineReveal → OnlineGamePage).

### `shared/ui/`

| Компонент      | Назначение                                                       |
| -------------- | ---------------------------------------------------------------- |
| `PhoneFrame`   | `SafeAreaView` + `maxWidth: 480` центровка                       |
| `YButton`      | `Pressable`, варианты: primary / ghost / era                     |
| `EraSelect`    | 3-кнопочный выбор эпохи                                          |
| `TextInput`    | RN `TextInput` с focus-состоянием (gold border)                  |
| `Banner`       | Информационная плашка: error / gold                              |
| `CatalogLine`  | Строка `left ··· right` в стиле каталожной записи               |
| `EraTag`       | Бейдж эпохи с цветом из ERA_COLORS                              |
| `GirihOverlay` | Тайловая сетка 16-лучевых SVG-звёзд (псевдо background-repeat)  |
| `PaperGrain`   | SVG-текстура «бумажного зерна» поверх блока                     |
| `Wordmark`     | Логотип YILLAR: Playfair Display + декоративная rule             |
| `Multiplier`   | Отображение множителя ×1 / ×3                                    |
| `GoldRule`     | Горизонтальный разделитель цвета gold                           |

---

## 5. Слой `entities`

### `entities/game` — главное состояние

**Zustand-стор** `useGameStore`. Не персистируется.

```ts
type State = {
  players: Player[];            // 4 слота, пустые имена = неактивные
  tracks: Track[];
  totalCards: number;
  currentCardIdx: number;
  currentPlayerIdx: number;
  status: "lobby" | "playing" | "reveal" | "ended";
  placements: Record<playerId, Placement[]>;
  scores: Record<playerId, number>;
  savedGameId: string | null;
  saveStarted: boolean;
};
```

**Ключевые экшены:** `startGame` · `lockIn` · `skipTurn` · `advanceTurn` · `beginSave`

**Селекторы:** `useActivePlayers` · `useCurrentPlayer` · `useCurrentTrack` · `useLastPlacement`

### `entities/session`

`useSessionStore` — `{ user, profile, loading }`. Заполняется через `SessionProvider`.

### `entities/preferences`

Zustand с `persist` middleware → `AsyncStorage["yillar.preferences"]`:

```ts
{ theme: "dark" | "light", language: "ru" | "uz" | "en" }
```

Язык при первом запуске определяется из `expo-localization`.

### `entities/track`

```ts
type Track = { id, title, artist, era: Era, year: number, youtubeId: string };
```

`getTracks(limit)` — случайная выборка из Supabase.  
`getTrackById(id)` — поиск по ID (используется в онлайн-режиме).

### `entities/placement`

```ts
type Placement = {
  trackId, guess, truth, delta, base, multiplier, bonus, points,
  era: Era, title, artist, correct: boolean, skipped?: boolean
};
```

### `entities/game-history`

`useProfileStats(userId)` — агрегаты: `gamesPlayed`, `bestScore`, `averageScore`, `wins`, `eraBreakdown[]`, `bestDecade`.

### `entities/room`

Realtime-хуки:

```ts
useRoom(code)              // SELECT rooms + Realtime UPDATE/DELETE
useRoomPlayers(roomId)     // SELECT room_players + INSERT/UPDATE/DELETE
useRoomGuesses(roomId, trackIdx?) // SELECT room_guesses + INSERT
```

Каждый хук патчит локальный массив по событиям (не рефетчит).

---

## 6. Слой `features`

### `features/game`

| Компонент      | Назначение                                                              |
| -------------- | ----------------------------------------------------------------------- |
| `SongCard`     | Карточка трека: DOSSIER-стиль, GirihOverlay + PaperGrain, redact-бары  |
| `AudioStrip`   | Плеер: 4 Reanimated EQ-бара, play/pause, прогресс                      |
| `Timeline`     | `@react-native-community/slider`, размещённые карточки, декады         |
| `ScoreboardBar`| Шапка: текущий игрок, прогресс карточек, мини-таблица очков            |

**`AudioStrip`** использует `react-native-reanimated`: `withRepeat(withTiming(...))` + `withDelay` для 4 баров с разными фазами — создаёт органичное EQ-движение.

**`SongCard`** использует хардкод `#1A1208` / `#F5EFE0` (не тема) — карточка намеренно era-neutral в обоих режимах.

### `features/reveal`

| Компонент        | Триггер                   | Особенности                                              |
| ---------------- | ------------------------- | -------------------------------------------------------- |
| `RevealStandard` | `delta > 0`, не пропуск   | Staged reveal 0→4: эра-фон, год, множитель, math         |
| `RevealPerfect`  | `delta === 0`             | SVG-звезда, gold-фон, staged reveal                      |
| `RevealRejected` | `skipped: true`           | Штамп REJECTED, "FOR THE RECORD" с правильным годом     |

Анимации через `useAnimatedStyle` + `withTiming` из `react-native-reanimated` (заменяют CSS `clip-path` / `animation`).

### `features/lobby`

`PlayerRoster` — список слотов игроков: TextInput для имени (uppercase, max 12), EraSelect, визуальный индикатор готовности.

### `features/navigation`

`BottomNav` — expo-router `usePathname()` + `useRouter()`. 2–3 вкладки в зависимости от состояния авторизации. Золотая линия под активным элементом.

### `features/save-game`

`saveGame(input)` — прямой вызов Supabase (не через TanStack Query mutation):
1. INSERT → `games` → `gameId`
2. Для каждого игрока INSERT → `game_players` → `gamePlayerId`
3. Batch INSERT → `placements`

Используется в `app/end.tsx` (solo) и `app/online/end/[code].tsx` (online, только хост).

---

## 7. Маршруты (`app/`)

### `app/index.tsx` (HomePage)

Два больших блока: **PASS & PLAY** и **ONLINE**. Хаптика при нажатии. Роутинг через `router.push`.

### `app/lobby.tsx` (LobbyPage)

`PlayerRoster` + кнопка старта (активна при: треки загружены, ≥2 игроков с именем и эпохой). При старте: `startGame(tracks)` → `router.replace("/game")`.

### `app/game.tsx` (GamePage)

Монтирует: `ScoreboardBar` + `SongCard` + `AudioStrip` + `Timeline` + footer с кнопками.  
`<audio.PlayerHost />` — скрытый WebView YouTube-плеера (`position: absolute, width: 1, height: 1, left: -9999`).  
Кнопки: ПРОПУСК (`skipTurn()`) и ЗАФИКСИРОВАТЬ (`lockIn()`) → `router.replace("/reveal")`.

### `app/reveal.tsx` (RevealPage)

Роутер-диспетчер: читает последний placement → рендерит RevealStandard / RevealPerfect / RevealRejected. `onNext` вызывает `advanceTurn()` → `router.replace("/game")` или `"/end"`.

### `app/end.tsx` (EndPage)

Рейтинг игроков, ERA BREAKDOWN, кнопки ПОДЕЛИТЬСЯ / ПОВТОР. Сохранение через `useEffect` + `beginSave()` guard. Шаринг через `expo-sharing`.

### `app/auth.tsx` (AuthPage)

Tabs: ВХОД / РЕГИСТРАЦИЯ + «Forgot password». KeyboardAvoidingView. Гостевой режим. DEMO MODE fallback.

### `app/profile.tsx` (ProfilePage)

Avatar initial circle (ERA_COLORS по `profile.generation`), stats boxes (`gamesPlayed` / `bestScore` / `averageScore`), theme switcher, language switcher (флаги SVG), sign out.

### `app/reset-password.tsx` (ResetPasswordPage)

Supabase автоматически устанавливает сессию при открытии deep link `yillar://reset-password`. Нет ручной обработки токена — `updatePassword(password)` вызывается с активной сессией.

### `app/online/` — Online маршруты

| Файл                       | Ключевые особенности                                                        |
| -------------------------- | --------------------------------------------------------------------------- |
| `index.tsx`                | Создать/войти; TextInput для кода (uppercase, 4 символа); DEMO MODE stub    |
| `room/[code].tsx`          | `ensureInRoom` guard; countdown overlay 3→0; копирование кода (`expo-clipboard`); `allReady` guard для старта |
| `game/[code].tsx`          | 60 с таймер; `autoSubmittedRef` guard; лидерборд из `sessionStore`; ждёт все гессы → navigate reveal |
| `reveal/[code]/[idx].tsx`  | Staged reveal 0→4; вычисляет нарастающий итог по всем предыдущим трекам; сохраняет в `sessionStore`; хост — кнопка «Next», не-хост — ждёт |
| `end/[code].tsx`           | Вычисляет все Placement[] за партию; хост сохраняет в Supabase; рематч через `resetRoom` |

---

## 8. Root layout (`app/_layout.tsx`)

```tsx
SplashScreen.preventAutoHideAsync();  // вызывается до рендера

GestureHandlerRootView
  └── SafeAreaProvider
        └── QueryProvider
              └── SessionProvider
                    └── ThemeProvider
                          ├── StatusBar style="light"
                          └── Stack screenOptions={{ headerShown: false }}
```

`useFonts({...})` загружает 18 шрифтовых начертаний. `SplashScreen.hideAsync()` вызывается в `useEffect` после `loaded === true`. До загрузки возвращается `null` (SplashScreen остаётся видимым).

---

## 9. База данных Supabase

### Таблицы

```sql
tracks
  id uuid PK · title text · artist text · era text · year int · youtube_id text

profiles
  id uuid FK→auth.users · display_name text · generation text(Era) · avatar_url text

games
  id uuid PK · host_id uuid · status text · total_cards int · ended_at timestamptz

game_players
  id uuid PK · game_id uuid · user_id uuid (null=гость) · guest_name text
  display_name text · generation text · total_score int · rank int · is_winner bool

placements
  id uuid PK · game_id uuid · game_player_id uuid · track_id uuid
  card_idx int · guess_year int · truth_year int · delta int · base int
  multiplier int · points int · era text · correct bool
```

```sql
rooms
  id uuid PK · code text UNIQUE · host_id uuid · status text
  track_ids text[] · current_track_idx int DEFAULT 0

room_players
  id uuid PK · room_id uuid ON DELETE CASCADE · player_id uuid
  name text · era text · is_host bool · joined_at timestamptz

room_guesses
  id uuid PK · room_id uuid ON DELETE CASCADE · track_idx int
  player_id uuid · guess_year int · submitted_at timestamptz
  UNIQUE (room_id, track_idx, player_id)
```

`rooms`, `room_players`, `room_guesses`: `REPLICA IDENTITY FULL` — обязательно для Realtime-фильтров.

### RLS-политики (принцип)

- `tracks` — SELECT для всех (анонимных тоже)
- `profiles` — SELECT/UPDATE только для `auth.uid() = id`
- `games` — INSERT/SELECT для `host_id = auth.uid()`
- `room_players` — SELECT только для участников комнаты

### Storage

Бакет `avatars`: путь `{userId}/{timestamp}.{ext}`, публичный URL, загрузка только для `auth.uid() = userId`.

---

## 10. Авторизация и сессия

### Сценарии пользователя

| Сценарий                  | Поведение                                              |
| ------------------------- | ------------------------------------------------------ |
| Первый запуск без Supabase | DEMO MODE, `user = null`                              |
| Первый запуск с Supabase  | авто `signInAnonymously()`                             |
| Гость                     | `isAnonymous: true`                                    |
| Зарегистрированный        | `isAnonymous: false`, профиль в `profiles`             |
| Повторный запуск          | Supabase восстанавливает сессию из `AsyncStorage`      |

### `SessionProvider`

1. `supabase.auth.getSession()` при монтировании
2. Если нет сессии → `signInAnonymously()`
3. `onAuthStateChange` подписка на весь жизненный цикл
4. Каждое изменение → `syncProfile(user)` (SELECT или INSERT в `profiles`)

### Deep links (авторизация)

- `yillar://confirm` — после email-подтверждения при регистрации
- `yillar://reset-password` — ссылка из письма сброса пароля

Supabase SDK подхватывает токен из URL автоматически при открытии deep link.

---

## 11. Система очков

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
  return { delta, base, multiplier, bonus, points: base * multiplier + bonus };
}
```

### Таблица результатов

| delta               | Своя эпоха           | Чужая эпоха          |
| ------------------- | -------------------- | -------------------- |
| 0 (идеально)        | 10 × 3 + 20 = **50** | 10 × 1 + 20 = **30** |
| 1                   | 9 × 3 = **27**       | 9 × 1 = **9**        |
| 5 (граница correct) | 5 × 3 = **15**       | 5 × 1 = **5**        |
| >10                 | 0                    | 0                    |

`correct = delta ≤ 5` — зелёная/красная рамка на Timeline и статистика.

---

## 12. Аудио: react-native-youtube-iframe

### Архитектура

`useYouTubeAudio(videoId)` — React-хук. Ключевая проблема: если `YoutubePlayer` получает `play` и `videoId` из `PlayerHost`'а deps, каждый `toggle()` пересоздаёт компонент → WebView ремонтируется (деструктивно).

**Решение: `InnerPlayer` forwardRef + `useImperativeHandle`**

```tsx
const InnerPlayer = forwardRef<InternalApi, InnerProps>(({ onStateChange, onReady }, ref) => {
  const ytRef = useRef<YoutubeIframeRef>(null);
  const [videoId, setVideoId] = useState<string | undefined>();
  const [play, setPlay] = useState(false);

  useImperativeHandle(ref, () => ({
    setPlaying: setPlay,
    setVideoId: (id) => { setVideoId(id); setPlay(false); },
    seekTo: (s) => ytRef.current?.seekTo(s, true),
    getCurrentTime: () => ytRef.current?.getCurrentTime() ?? Promise.resolve(undefined),
    getDuration: () => ytRef.current?.getDuration() ?? Promise.resolve(undefined),
  }), []);

  if (!videoId) return null;
  return <YoutubePlayer ref={ytRef} height={1} width={1} videoId={videoId} play={play}
    onChangeState={onStateChange} onReady={onReady}
    webViewProps={{ allowsInlineMediaPlayback: true }} />;
});

// PlayerHost — нулевые зависимости, никогда не ремонтируется
const PlayerHost = useCallback((): JSX.Element => (
  <View style={{ position: "absolute", width: 1, height: 1, left: -9999, top: -9999, opacity: 0 }}
    pointerEvents="none">
    <InnerPlayer ref={innerRef} onStateChange={...} onReady={...} />
  </View>
), []);
```

`PlayerHost` рендерится в `GamePage` и `OnlineGamePage` как `<audio.PlayerHost />`.

---

## 13. Темы и дизайн-система

### `src/theme/tokens.ts`

```ts
export const DARK_COLORS: Colors = {
  ink: "#1A1208", ink2: "#2A1E10", ink3: "#3A2C1C",
  cream: "#F5EFE0", cream2: "#E8DFCA", cream3: "#C9BFA6",
  gold: "#D4A847", goldDeep: "#A8832F", ...
};
export const LIGHT_COLORS: Colors = {
  ...DARK_COLORS,
  ink: "#F0EEE9", ink2: "#E6E2DA", ink3: "#CFC9BD",
  cream: "#1A1208", cream2: "#2A1E10", cream3: "#3A2C1C",
  ...
};
export const ERA_COLORS: Record<Era, EraColors> = {
  klassika: { primary: "#7B3F2A", deep: "#4E271B", surface: "#EDE0C4", ... },
  kasseta:  { primary: "#C4572A", deep: "#8B3A18", surface: "#E8C892", ... },
  tsifra:   { primary: "#2A5C7B", deep: "#163A52", surface: "#E6EEF2", ... },
};
export const fonts = {
  display: "PlayfairDisplay-Black",
  body: "OpenSans-Regular",
  condensedBold: "OpenSansCondensed-Bold",
  mono: "IBMPlexMono-Regular",
  monoBold: "IBMPlexMono-Bold",
  ...
};
// Хелперы (letter-spacing и line-height в RN — абсолютные px, не em):
export const tracking = (em: number, fontSize: number): number => em * fontSize;
export const leading = (ratio: number, fontSize: number): number => ratio * fontSize;
```

### `ThemeProvider`

```tsx
// src/theme/ThemeProvider.tsx
export function ThemeProvider({ children }) {
  const theme = usePreferencesStore((s) => s.theme);
  const value = useMemo(() => ({
    theme,
    colors: theme === "light" ? LIGHT_COLORS : DARK_COLORS,
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

Компоненты вызывают `useTheme()` → получают `{ theme, colors }`.

### Шрифты

| Семья               | Начертания                    | Загрузка                                   |
| ------------------- | ----------------------------- | ------------------------------------------ |
| Playfair Display    | 700Bold, 900Black             | `@expo-google-fonts/playfair-display`      |
| IBM Plex Mono       | 300–700 (5 начертаний)        | `@expo-google-fonts/ibm-plex-mono`         |
| Open Sans           | Regular, Medium, SemiBold, Bold, ExtraBold, Italic | TTF из `src/shared/assets/fonts/` |
| Open Sans Condensed | Regular, Medium, SemiBold, Bold, ExtraBold | TTF из `src/shared/assets/fonts/` |
| Open Sans Semi Cond | Regular, SemiBold, Bold       | TTF из `src/shared/assets/fonts/`          |

Все 18 начертаний загружаются в `app/_layout.tsx` через `useFonts()`.

---

## 14. Локализация (i18n)

```
src/shared/lib/i18n/
  translations.ts   — словари ru / uz / en, тип TranslationKey (union)
  index.ts          — функция t(), хук useT()
```

```ts
const t = useT();
t("game.lockIn", { year: 1987 })  // → "ЗАФИКСИРОВАТЬ · 1987 →"
```

`TranslationKey` — union type всех ключей. Опечатка = ошибка компиляции.

Автодетекция языка при первом запуске:

```ts
import * as Localization from "expo-localization";
const code = Localization.getLocales()[0]?.languageCode;
```

---

## 15. Настройки пользователя

`usePreferencesStore` (Zustand + persist → `AsyncStorage["yillar.preferences"]`):

```ts
{ theme: "dark" | "light", language: "ru" | "uz" | "en" }
```

Применяются мгновенно через реактивные подписки. Сохраняются между запусками приложения.

---

## 16. Поток данных: полная партия

```
[HomePage]
  → /lobby

[LobbyPage]
  getTracks(12)              → Supabase → 12 треков
  players[0..3]              ← PlayerRoster (имена + эпохи)
  startGame(tracks)          → useGameStore → /game

[GamePage] × (totalCards × activePlayers)
  currentTrack               ← useCurrentTrack()
  useYouTubeAudio(ytId)      → react-native-youtube-iframe WebView
  guessYear                  ← Timeline Slider → setGuess()
  lockIn() / skipTurn()      → Placement + /reveal

[RevealPage]
  last placement             ← useLastPlacement()
  → RevealPerfect | RevealStandard | RevealRejected
  advanceTurn()              → /game или /end

[EndPage]
  placements, scores         ← useGameStore
  ranked = activePlayers.sort(score desc)
  saveGame(input)            → Supabase (games + game_players + placements)
  reset()                    → /
```

### Online-партия

```
[OnlinePage]
  createRoom(hostId, name)           → Supabase → room + room_players(host)
  joinRoom(code, userId, name)       → room_players(guest)

[WaitingRoomPage] ← useRoom / useRoomPlayers (Realtime)
  ensureInRoom()                     → проверяет/добавляет игрока
  updateRoomPlayer(name, era)        → room_players UPDATE
  startGame(roomId, trackIds)        → rooms.status = 'playing'
  countdown 3→0                      → /online/game/:code

[OnlineGamePage] × totalTracks  ← useRoom / useRoomGuesses (Realtime)
  useYouTubeAudio(ytId)
  submitGuess(roomId, idx, playerId, year) → room_guesses UPSERT
  таймер 60 с → авто-сабмит при timeLeft === 0
  guesses.length >= players.length   → /online/reveal/:code/:idx

[OnlineRevealPage]
  getRoomGuesses(roomId)             → все гессы
  calcScore × каждый игрок × каждый предыдущий трек → нарастающий итог
  sessionStore.setItem(scores)       → для следующего game-экрана
  host: advanceTrack()              → rooms.current_track_idx++ или status='ended'
  non-host: room.currentTrackIdx изменился → /online/game/:code

[OnlineEndPage]
  getRoomGuesses(roomId)            → все гессы
  calcScore → Placement[] для каждого игрока
  host: saveGame(input)             → Supabase
  host: resetRoom(roomId)           → room_guesses DELETE + status='waiting'
  non-host: room.status='waiting'   → /online/room/:code
```

---

## 17. Ключевые технические решения

### Metro + Supabase OTel (критично)

`@supabase/supabase-js` v2.105.1+ добавил опциональный OpenTelemetry с `import(OTEL_PKG)` — variable dynamic import, который Hermes не компилирует. Metro по умолчанию выбирает ESM (`exports` → `import` condition). Решение:

```js
// metro.config.js
config.resolver.unstable_enablePackageExports = false;
// Metro переключается на поле main → .cjs → Promise.resolve().then(require) — Hermes-совместимо
```

### Stable `PlayerHost` через `useImperativeHandle`

Если `YoutubePlayer` получает `videoId` и `play` напрямую как пропсы из хука, каждый `toggle()` пересоздаёт функцию `PlayerHost` → React размонтирует/монтирует компонент → WebView уничтожается. Решение: внутренний компонент `InnerPlayer` держит своё состояние, хук управляет им через ref. `PlayerHost` — `useCallback` с нулевыми зависимостями, никогда не ремонтируется.

### Guard `beginSave()`

`EndPage` рендерится несколько раз из-за зависимостей `useEffect`. Атомарный guard:

```ts
beginSave: () => {
  if (get().saveStarted) return false;
  set({ saveStarted: true });
  return true;
},
```

### `sessionStore` вместо `sessionStorage`

Браузерный `sessionStorage` недоступен в React Native. Заменён на модульную Map в `src/shared/lib/sessionStore.ts`. Данные живут в памяти процесса — что полностью эквивалентно `sessionStorage` для данного use case (накопленные очки OnlineReveal → OnlineGamePage).

### `SongCard` — хардкод цветов

Карточка используется в обоих режимах (Pass & Play, Online). Она **не должна** инвертироваться при смене темы — тёмный текст на бежевом фоне всегда. Решение: `backgroundColor: "#F5EFE0"`, `color: "#1A1208"` — не из `useTheme()`.

### GirihOverlay — тайловый SVG вместо background-repeat

React Native не поддерживает `background-image: repeat`. `GirihOverlay` рендерит сетку SVG-компонентов через `Array.from({length: rows × cols})` с абсолютным позиционированием в контейнере `overflow: "hidden"`.

### Reanimated EQ-анимация

4 бара с разными `withDelay` и разными `duration` в `withRepeat(withTiming(...))`. Отрицательные начальные фазы создают ощущение живого, несинхронного движения.

---

## 18. Сборка: EAS Build

```json
// eas.json
{
  "build": {
    "development": { "developmentClient": true, "android": { "buildType": "apk" } },
    "preview":     { "distribution": "internal", "android": { "buildType": "apk" } },
    "production":  { "android": { "buildType": "app-bundle" } }
  }
}
```

**Профили:**
- `development` — dev-клиент с Metro, для разработки на устройстве
- `preview` — внутренний APK для тестирования
- `production` — AAB для Google Play

**Иконки:** `assets/icon.png` (1024×1024), `assets/adaptive-icon.png` (1024×1024), `assets/splash.png` (1080×1920). Placeholder-версии генерируются через `node scripts/gen-assets.mjs`.

**Deep links:** `scheme: "yillar"` в `app.json`. Android `intentFilters` настроены для `yillar://` схемы.

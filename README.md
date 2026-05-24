# YILLAR · The Game of Years

### Советский конструктивизм × узбекский жирих · Угадай год выхода песни

---

## О проекте

**YILLAR** (узб. «Годы») — мобильная музыкальная викторина: звучит отрывок песни, игрок перетаскивает указатель на временно́й шкале и угадывает год выхода трека. Чем точнее — тем больше очков. Если угадал песню из своей эпохи — ×3 бонус. Идеальное угадывание — +20 к счёту.

Два режима игры:

- **Pass & Play** — на одном устройстве, 2–4 игрока
- **Online** — синхронный мультиплеер через Supabase Realtime, каждый на своём устройстве

> **Ветки:** `dev` — веб-версия (React + Vite + PWA). `chore/mobile` — нативный Android (React Native + Expo SDK 56), общий бэкенд Supabase.

---

## Стек технологий (mobile, ветка `chore/mobile`)

| Слой           | Технологии                                                  |
| -------------- | ----------------------------------------------------------- |
| Фреймворк      | React Native 0.85 · Expo SDK 56 · React 19                 |
| Навигация      | expo-router v3 (file-based, deep links)                     |
| Стили          | `StyleSheet.create()` + токены в `src/theme/tokens.ts`      |
| Темы           | React Context `ThemeProvider` (dark / light)                |
| Хранилище      | Zustand + `@react-native-async-storage/async-storage`       |
| Сервер         | Supabase (PostgreSQL · Realtime · RLS · Storage)            |
| Запросы        | TanStack Query v5                                           |
| Аудио          | `react-native-youtube-iframe` (WebView)                     |
| Анимации       | `react-native-reanimated` v4                                |
| SVG            | `react-native-svg` + `react-native-svg-transformer`         |
| Шрифты         | `expo-font` · `@expo-google-fonts/playfair-display` · IBM Plex Mono · Open Sans TTF |
| Сборка         | EAS Build (Android APK / AAB)                              |
| Локализация    | Самодельный i18n: RU · UZ · EN · `expo-localization`        |

---

## Архитектура

Feature-Sliced Design, адаптированный под expo-router:

```
app/                          expo-router маршруты
├── _layout.tsx               root: шрифты, провайдеры, SplashScreen
├── index.tsx                 HomePage
├── lobby.tsx                 Pass & Play лобби
├── game.tsx                  Игровой экран
├── reveal.tsx                Результат хода
├── end.tsx                   Итоги партии
├── auth.tsx                  Вход / регистрация / гость
├── profile.tsx               Профиль, настройки
├── reset-password.tsx        Смена пароля (deep link)
└── online/
    ├── index.tsx             Online — создать / войти
    ├── room/[code].tsx       Ожидание: имя, эпоха, старт
    ├── game/[code].tsx       Online-ход (60 с таймер)
    ├── reveal/[code]/[idx].tsx  Результаты раунда
    └── end/[code].tsx        Финал, рематч

src/
├── shared/
│   ├── api/                  supabaseClient (AsyncStorage adapter)
│   ├── config/               env.ts (EXPO_PUBLIC_*)
│   ├── lib/                  scoring · era · i18n · haptic · share · sessionStore · useYouTubeAudio
│   ├── ui/                   PhoneFrame · Wordmark · YButton · EraSelect · TextInput
│   │                         Banner · FieldLabel · CatalogLine · GirihOverlay · PaperGrain · …
│   └── assets/               fonts/ · svg/ (girih, paper-grain, nav-icons, flags)
├── entities/                 game · player · placement · track · room · session · game-history · preferences
├── features/
│   ├── game/                 SongCard · AudioStrip · Timeline · ScoreboardBar
│   ├── lobby/                PlayerRoster
│   ├── navigation/           BottomNav
│   ├── reveal/               RevealStandard · RevealPerfect · RevealRejected
│   └── save-game/            saveGame API
└── theme/
    ├── tokens.ts             цвета, шрифты, ERA_COLORS, tracking(), leading()
    ├── ThemeProvider.tsx     dark/light Context
    └── useTheme.ts
```

---

## Игровая механика

### Очки

| Ситуация        | Формула                               |
| --------------- | ------------------------------------- |
| Базовые очки    | `MAX(0, 10 − |guess − truth|)`        |
| Множитель эпохи | `× 3` если эпоха трека = эпоха игрока |
| Бонус идеала    | `+20` если угадал точный год          |

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

### Переменные окружения

Скопируй `.env.example` → `.env` и заполни:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Без ключей приложение работает в **DEMO MODE** — без авторизации, истории и онлайн-режима.

### Запуск в эмуляторе / на устройстве

```bash
npm install
npx expo start --android
```

### Сборка APK через EAS

```bash
# preview APK (внутреннее тестирование)
eas build --profile preview --platform android

# production AAB (Google Play)
eas build --profile production --platform android
```

### Генерация иконок

Placeholder-иконки уже в `assets/`. Для замены реальными:

```bash
# Обнови scripts/gen-assets.mjs и запусти:
node scripts/gen-assets.mjs
```

---

## Маршруты

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
/reset-password          Смена пароля (deep link yillar://reset-password)
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
Язык хранится в Zustand `usePreferencesStore` → AsyncStorage `yillar.preferences`  
Начальный язык определяется через `expo-localization`

---

## Дизайн-система

- **Цвет** — `DARK_COLORS` / `LIGHT_COLORS` в `tokens.ts`; `ERA_COLORS` по трём эпохам
- **Светлая тема** — переключается через `ThemeProvider`, хранится в `usePreferencesStore`
- **Шрифты** — Open Sans (condensed/semi-condensed), Playfair Display, IBM Plex Mono
- **Орнамент** — 16-лучевая гирих-звезда SVG + PaperGrain текстура (via `react-native-svg`)
- **Хаптика** — `expo-haptics` (light / medium / heavy)

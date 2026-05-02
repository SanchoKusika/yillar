# YILLAR · The Game of Years

### Советский конструктивизм × узбекский жирих · Угадай год — 4 игрока, pass-and-play

---

## О проекте

**YILLAR** (узб. «Годы») — мобильная музыкальная викторина: звучит отрывок песни, игроки перетаскивают карточки на временну́ю шкалу и угадывают год выхода трека. Чем точнее — тем больше очков. Если угадал песню из своей эпохи — ×3 бонус. Идеальное угадывание — +20 к счёту.

Игра на одном устройстве (pass-and-play), от 2 до 4 игроков.

---

## Стек технологий

| Слой            | Технологии                                      |
| --------------- | ----------------------------------------------- |
| Фронтенд        | React 18 · TypeScript · Vite 5                  |
| Стили           | Tailwind CSS v4 (`@theme` токены) · CSS Modules |
| Хранилище       | Zustand + localStorage persist                  |
| Сервер          | Supabase (PostgreSQL · RLS · Storage)           |
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
├── pages/          # home · game · reveal · end · auth · profile
├── widgets/        # audio-strip · player-roster · song-card
│                   # timeline · scoreboard-bar · bottom-nav · pwa-prompt
├── features/       # save-game
├── entities/       # game · player · placement · track
│                   # session · game-history · preferences
└── shared/         # ui · lib (i18n, scoring, era) · api · config · assets
```

---

## Игровая механика

### Очки

| Ситуация        | Формула                               |
| --------------- | ------------------------------------- | ------------- | --- |
| Базовые очки    | `MAX(0, 30 −                          | guess − truth | )`  |
| Множитель эпохи | `× 3` если эпоха трека = эпоха игрока |
| Бонус идеала    | `+20` если угадал точный год          |

Примеры: точное попадание в свою эпоху = **30 × 3 + 20 = 110**, промах на 5 лет без бонуса = **25**.

### Эпохи

| Код        | Название           | Годы      |
| ---------- | ------------------ | --------- |
| `klassika` | КЛАССИКА / CLASSIC | 1960–1989 |
| `kasseta`  | КАССЕТА / CASSETTE | 1990–1999 |
| `tsifra`   | ЦИФРА / DIGITAL    | 2000+     |

---

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Разработка
npm run dev

# Продакшн-сборка
npm run build
```

### Переменные окружения

Скопируй `.env.example` → `.env.local` и заполни:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Без Supabase-ключей приложение запускается в **DEMO MODE** — без сохранения истории и авторизации.

---

## Экраны

```
/           Главная — состав игроков, выбор эпохи, старт
/game       Игровой экран — карточка, аудиополоска, шкала
/reveal     Результат хода — Standard / Perfect / Rejected
/end        Итоги партии — победитель, разбивка по игрокам
/auth       Вход / регистрация / гостевой режим
/profile    Профиль — статы, история, друзья, настройки
```

---

## База данных (Supabase)

```
tracks          id · title · artist · era · year · youtube_id
games           id · host_id · total_cards · started_at
game_players    id · game_id · display_name · generation · rank · is_winner
placements      id · game_player_id · track_id · guess · truth · delta
                · correct · points · bonus · skipped · era
```

---

## Локализация

Переводы: `src/shared/lib/i18n/translations.ts`  
Хук: `useT()` — возвращает функцию `t(key, params?)` с подстановкой `{n}`  
Язык хранится в Zustand `usePreferencesStore` → localStorage `yillar.preferences`

---

## Дизайн-система

- **Цвет** — `--color-ink` / `--color-cream` / `--color-gold` + токены по эпохам (`--color-klassika-primary` и т.д.)
- **Светлая тема** — переопределение через `[data-theme="light"]` на `<html>`
- **Шрифты** — Open Sans (condensed/semi-condensed), Playfair Display, IBM Plex Mono
- **Орнамент** — 16-лучевая гирих-звезда SVG + PaperGrain текстура

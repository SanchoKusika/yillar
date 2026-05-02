# TODO · YILLAR

Нереализованные этапы и задачи. Приоритет: 🔴 высокий · 🟡 средний · 🟢 низкий.

---

## 🔴 Критичные / Ближайший релиз

### Каталог треков

- [ ] Добавить треки до полного объёма — **33 на каждую эпоху** (итого 99)
    - КЛАССИКА (1960–89): сейчас ~10–15 треков
    - КАССЕТА (1990–99): сейчас ~10–15 треков
    - ЦИФРА (2000+): сейчас ~10–15 треков
- [ ] Проверить корректность `era` и `year` у каждого трека в БД
- [ ] Убедиться, что у всех треков есть рабочий `youtube_id`

### Кнопка SHARE (EndPage)

- [ ] Реализовать через Web Share API (`navigator.share`)
- [ ] Fallback: копировать текст итогов в буфер обмена
- [ ] Сформировать красивый текст-результат (победитель, очки, состав)

---

## 🔴 Авторизация и данные

### Миграция истории гостя → зарегистрированный аккаунт

- [ ] При регистрации гостя: перенести `games` / `placements` с `host_id` анонимного пользователя на новый `auth.uid()`
- [ ] Обновить RLS-политики для переноса
- [ ] Обработать конфликты (одинаковые `game_id`)

### Сброс пароля

- [ ] Добавить на AuthPage ссылку «Забыли пароль?»
- [ ] Реализовать через `supabase.auth.resetPasswordForEmail`
- [ ] Сделать отдельный экран `/reset-password` для ввода нового пароля

---

## 🟡 Социальные функции

### Друзья (FriendsTab)

- [ ] Создать таблицу `friendships` (user_id, friend_id, status: pending/accepted)
- [ ] RLS: пользователь видит только свои строки
- [ ] API: `sendFriendRequest`, `acceptFriendRequest`, `removeFriend`
- [ ] UI: поиск по нику / email, список входящих заявок, список друзей
- [ ] Недельный лидерборд — рейтинг среди друзей за последние 7 дней
- [ ] Статус online (Supabase Realtime Presence)

---

## 🟡 Нативное приложение (Capacitor)

- [ ] Установить и настроить `@capacitor/core`, `@capacitor/ios`, `@capacitor/android`
- [ ] Настроить `capacitor.config.ts`
- [ ] Заменить YouTube IFrame на нативный плеер или WebView-мост
- [ ] Тестировать на iOS Simulator / Android Emulator
- [ ] App Store / Google Play — подготовить иконки нужных размеров, скриншоты, описание
- [ ] Настроить Deep Links для reset-password flow

---

## 🟡 UX и полировка

### Игровой процесс

- [ ] Анимация при старте партии (splash / countdown)
- [ ] Звуковые эффекты: правильный ответ, идеальный, пропуск
- [ ] Haptic feedback на мобильных (Capacitor Haptics)
- [ ] Таймер хода (опционально, настройка в лобби)

### Профиль

- [ ] Удаление аккаунта (`supabase.auth.admin.deleteUser` через Edge Function)
- [ ] Смена email / пароля из Settings
- [ ] Публичный профиль — страница `/u/:username` (для шаринга)

### End Screen

- [ ] Анимация confetti / гирих-частицы для победителя
- [ ] Показывать рекорд — побит ли личный рекорд

---

## 🟢 Технический долг

### Производительность

- [ ] Code splitting — `vite build` предупреждает о chunk >500 КБ
    - Разделить: YouTube-плеер, страницы reveal, ProfilePage
- [ ] Prefetch треков следующей карточки пока играет текущая

### Тесты

- [ ] Unit-тесты для `calcScore` (`src/shared/lib/scoring.ts`)
- [ ] Unit-тесты для `useGameStore` (lockIn, skipTurn, reset)
- [ ] Integration-тест: полный игровой цикл (lobby → game → reveal × N → end)

### Инфраструктура

- [ ] CI/CD: GitHub Actions → `npm run build` на каждый PR
- [ ] Supabase migrations в репозитории (`supabase/migrations/`)
- [ ] Seed-скрипт для тестового каталога треков
- [ ] Настроить Supabase Edge Function для опасных операций (удаление аккаунта)

---

## ✅ Реализовано

- [x] Базовый игровой цикл (lobby → game → reveal → end)
- [x] Система очков (базовые + мультипликатор эпохи + бонус идеала)
- [x] Три варианта reveal: Standard · Perfect · Rejected
- [x] Профиль: статы, история, друзья (заглушка), настройки
- [x] Авторизация: email + password, гостевой режим, анонимный вход
- [x] PWA: манифест, service worker, install/update prompt, offline-ready toast
- [x] Сохранение партии в Supabase (games + game_players + placements)
- [x] Статистика: ERA BREAKDOWN (уникальные угаданные / всего в каталоге)
- [x] История партий (последние 10)
- [x] Смена темы: тёмная (INK) / светлая (PAPER)
- [x] Смена языка: RU · UZ · EN (полный перевод всего UI)
- [x] Аватар: загрузка в Supabase Storage
- [x] VU-meter анимация аудиополоски
- [x] SongCard: era-neutral дизайн (не раскрывает эпоху)
- [x] Гирих-звезда и PaperGrain текстуры
- [x] EraTag с цветом первичной эпохи

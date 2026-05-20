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

- [x] При регистрации гостя история сохраняется автоматически: `signUpWithEmail` использует `sb.auth.updateUser` для анонимных пользователей, что сохраняет тот же UUID → `host_id` не меняется, данные доступны сразу
- [x] UX: при мгновенном подтверждении показывается `auth.migrationNotice` («История партий перенесена»)
- [x] RLS-политики проверены: нет ни одной проверки `is_anonymous`; все политики используют только `auth.uid() = host_id` → апгрейд через `updateUser` сохраняет UUID, доступ к играм не нарушается
- [ ] **Known limitation (cross-device):** если пользователь сыграл несколько партий как гость на _другом_ устройстве (anon_id=Y) и затем вошёл в аккаунт (id=X) — партии под Y не мигрируют. Требует Edge Function с `serv
     +ice_role`: перед `signInWithEmail` запомнить Y, после входа вызвать RPC `UPDATE games SET host_id=X WHERE host_id=Y`

### Сброс пароля

- [x] Добавить на AuthPage ссылку «Забыли пароль?» (режим `"forgot"`)
- [x] Реализовать через `supabase.auth.resetPasswordForEmail` → `resetPasswordForEmail()` в sessionApi
- [x] Отдельный экран `/reset-password` для ввода нового пароля (использует `PASSWORD_RECOVERY` event)

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

- [x] Анимация при старте партии: countdown 3-2-1 (Pass & Play + Online)
- [ ] Звуковые эффекты: правильный ответ, идеальный, пропуск
- [ ] Haptic feedback на мобильных (Capacitor Haptics)
- [x] Таймер хода в онлайн-режиме — автосабмит (60 с, прогресс-бар)

### Профиль

- [ ] Удаление аккаунта (`supabase.auth.admin.deleteUser` через Edge Function)
- [x] Смена пароля из Settings (`PasswordChange.tsx` — полностью реализован)
- [ ] Смена email из Settings
- [ ] Публичный профиль — страница `/u/:username` (для шаринга)

### End Screen

- [x] Анимация гирих-частицы для победителя (PARTICLES + `styles.particle` в EndPage)
- [x] Показывать рекорд — побит ли личный рекорд (`isNewRecord` + `end.newRecord` banner в EndPage)

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
- [x] Supabase migrations в репозитории (`supabase/migrations/` — 3 файла: init, auth_history, grants)
- [ ] Seed-скрипт для тестового каталога треков
- [ ] Настроить Supabase Edge Function для опасных операций (удаление аккаунта)

---

## 🟢 Online режим

### Завершено
- [x] Экран выбора режима на главной (`/`) — два блока: PASS & PLAY и ONLINE
- [x] Pass & Play лобби перенесён на `/lobby`
- [x] Supabase таблицы: `rooms`, `room_players`, `room_guesses` + Realtime + RLS
- [x] Online лобби (`/online`) — создать комнату / войти по коду
- [x] Waiting Room (`/online/room/:code`) — Realtime список игроков, ввод имени + эпохи, кнопка старта
- [x] Онлайн-игровой экран (`/online/game/:code`) — каждый угадывает одновременно, пипсы ожидания
- [x] Онлайн-ревил (`/online/reveal/:code/:trackIdx`) — таблица результатов всех, анимация года, Perfect-вариант
- [x] Онлайн-финал (`/online/end/:code`) — итоговый лидерборд с очками
- [x] Таймер хода — автосабмит по истечении (60 с, прогресс-бар)
- [x] Обработка дисконнекта: таймер автосабмитит за ушедшего; хост удаляет комнату при выходе из лобби; 8 с escape-редирект на reveal при хост-дропе
- [x] Сохранение онлайн-партии в `games` таблицу (хост сохраняет на EndPage)
- [x] Колонка «Итого» в reveal-таблице (нарастающий итог по всем раундам)
- [x] Реальный рематч: `resetRoom()` сбрасывает комнату в waiting, все игроки возвращаются в лобби
- [x] Countdown 3-2-1 при старте игры (WaitingRoomPage)
- [x] Пульсирующий индикатор «● ОЖИДАНИЕ ХОСТА» на всех экранах ожидания
- [x] Мини-лидерборд на игровом экране после первого раунда
- [x] Non-host «Сыграть ещё» ждёт сброса комнаты хостом
- [x] Карточки прошлых угадок в Timeline онлайн-игры (как в Pass & Play)

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
- [x] Анимация гирих-частицы для победителя (EndPage)
- [x] Показывать рекорд — побит ли личный рекорд (EndPage)
- [x] Смена пароля из Settings (`PasswordChange.tsx`)
- [x] Supabase migrations в репозитории (`supabase/migrations/`)

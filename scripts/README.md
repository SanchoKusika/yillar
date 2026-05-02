# Scripts

## import-tracks

Импортирует список узбекских треков (`scripts/uzbek-tracks.json`) в таблицу
`tracks` Supabase. Для каждой записи ищет видео через YouTube Data API,
проверяет что оно публичное и embeddable, после чего пишет/обновляет строку.

### Что нужно в `.env.local`

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
YT_API_KEY=AIzaSy...
```

`SUPABASE_SERVICE_ROLE_KEY` — Settings → API Keys → Secret keys → Reveal.
Никогда не коммитить (`.env.local` уже в `.gitignore`).

### Команды

```bash
npm run import:tracks:dry     # сухой прогон, ничего не пишет в БД, только логи
npm run import:tracks         # обычный импорт (upsert по artist+title)
npm run import:tracks:reset   # очистить tracks и перезалить с нуля
```

### Что делает по каждому треку

1. `search.list` запрос `${artist} ${title} o'zbek` (relevanceLanguage=uz)
2. Берёт топ-5 кандидатов
3. `videos.list` запрос на их `status` — фильтрует не-embeddable / приватные / regionRestriction.blocked
4. Первый прошедший — пишется в БД
5. Если совпадает по `(artist, title)` — обновляет, иначе вставляет

### Quota YouTube Data API

- Бесплатно 10 000 unit/день
- Один трек = 100 (search) + 1 (videos) = ~101 unit
- 99 треков ≈ 10 000 unit, в самый край
- Если квота исчерпалась — подождать до полуночи по тихоокеанскому времени (Google reset)
- Можно сократить расход поправив `maxResults` в скрипте на меньшее

### Если что-то не сыграло

Открыть **Table Editor → tracks** в Supabase Studio, найти строку, заменить `youtube_id` вручную.

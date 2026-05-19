# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server at localhost:5173
npm run build        # tsc -b && vite build
npm run lint         # ESLint

# Track data management (Supabase)
npm run import:tracks         # import tracks to Supabase
npm run import:tracks:reset   # reset & reimport
npm run import:tracks:dry     # dry run
```

There are no test commands — the project has no test suite.

## Environment

Copy `.env.example` → `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Without these keys the app runs in **DEMO MODE** (no auth, no history saving). `supabase` client is `null` in demo mode — all DB calls guard with `if (!supabase) return`.

## Architecture

**Feature-Sliced Design (FSD)** — imports flow strictly downward: `app → pages → widgets → features → entities → shared`. Each slice exposes a public API through its `index.ts`.

### Path aliases

| Alias       | Path           |
| ----------- | -------------- |
| `@shared`   | `src/shared`   |
| `@entities` | `src/entities` |
| `@features` | `src/features` |
| `@widgets`  | `src/widgets`  |
| `@pages`    | `src/pages`    |
| `@app`      | `src/app`      |

### State management

- **`useGameStore`** (Zustand, not persisted) — the primary game state: players, tracks, current turn, placements, scores. All game mutations go through this store's actions (`startGame`, `lockIn`, `skipTurn`, `advanceTurn`, `beginSave`).
- **`useSessionStore`** (Zustand, not persisted) — auth user + profile. Populated by `SessionProvider` on mount.
- **`usePreferencesStore`** (Zustand + `persist` → `localStorage["yillar.preferences"]`) — theme and language.

### Routes

| Path                          | Component            | Notes                                         |
| ----------------------------- | -------------------- | --------------------------------------------- |
| `/`                           | `HomePage`           | Mode select — Pass & Play vs Online           |
| `/lobby`                      | `LobbyPage`          | Pass & Play player setup                      |
| `/game`                       | `GamePage`           | Active turn                                   |
| `/reveal`                     | `RevealPage`         | Post-guess reveal (Standard/Perfect/Rejected) |
| `/end`                        | `EndPage`            | Score summary, save to Supabase               |
| `/online`                     | `OnlinePage`         | Online mode — create or join room             |
| `/online/room/:code`          | `WaitingRoomPage`    | Lobby — players set name/era, host starts     |
| `/online/game/:code`          | `OnlineGamePage`     | Active online turn (60 s timer)               |
| `/online/reveal/:code/:idx`   | `OnlineRevealPage`   | Online reveal with per-player scores table    |
| `/online/end/:code`           | `OnlineEndPage`      | Online final leaderboard, rematch/home        |
| `/auth`                       | `AuthPage`           | Sign-in / sign-up / forgot-password           |
| `/profile`                    | `ProfilePage`        | Stats, history, friends, settings             |
| `/reset-password`             | `ResetPasswordPage`  | Handles `PASSWORD_RECOVERY` Supabase event    |
| `*`                           | redirect → `/`       |                                               |

### Game flow

`/` → `/game` → `/reveal` → back to `/game` or `/end`

Each turn: player guesses year via `<input type="range" min=1960 max=2025>` in the Timeline widget → `lockIn()` or `skipTurn()` → Placement is created → reveal screen → `advanceTurn()`.

Reveal variants are chosen from the last placement: `skipped` → `RevealRejected`, `delta === 0` → `RevealPerfect`, otherwise → `RevealStandard`.

Saving happens once on EndPage via `useEffect` + `beginSave()` guard (prevents double-save on re-renders).

### Scoring (`src/shared/lib/scoring.ts`)

```
base = MAX(0, 10 − |guess − truth|)
multiplier = 3 if track era === player era, else 1
bonus = 20 if delta === 0
points = base × multiplier + bonus
correct = delta ≤ 5
```

### Audio

`useYouTubeAudio(videoId)` hook wraps the YouTube IFrame API. The player mounts inside a hidden div positioned at `left: -9999px` (not `display:none` — the SDK won't initialize inside hidden elements). `PlayerHost` component is rendered in `GamePage`.

### Haptic

`haptic(type)` in `src/shared/lib/haptic.ts` calls `navigator.vibrate` (Web Vibration API — no Capacitor). Used on button presses in `HomePage` and `GamePage`. Silently no-ops where the API is absent.

### Eras

Three eras defined in `src/shared/lib/era.ts`:

- `klassika` — 1960–1989
- `kasseta` — 1990–1999
- `tsifra` — 2000+

### Styling

- **Tailwind CSS v4** with `@theme` tokens in `src/app/styles/index.css`
- CSS Modules for component-level styles
- Dark/light themes via `data-theme="dark/light"` on `<html>`, managed by `ThemeProvider`
- `SongCard` uses hardcoded `color: #1A1208` (not a CSS var) so it stays dark-text-on-cream in both themes — intentional

### i18n

`useT()` hook → returns `t(key, params?)`. All translation keys are a union type — typos cause compile errors. Translations: `src/shared/lib/i18n/translations.ts`. Language stored in `usePreferencesStore`.

### Supabase schema

`tracks`, `profiles`, `games`, `game_players`, `placements` — see `ARCHITECTURE.md` §10 for full column definitions and RLS policy summary.

Migrations live in `supabase/migrations/` (0001 init tracks, 0002 auth/history, 0003 grants, 0005 rooms code→text + REPLICA IDENTITY FULL). Apply via Supabase MCP or `supabase db push`.

### Online mode

Rooms flow: `waiting` → `playing` → `ended`. `resetRoom()` returns a room to `waiting` (deletes guesses, resets `current_track_idx=0`, `track_ids=[]`) enabling rematch with the same players.

Key API functions in `src/entities/room/api/roomsApi.ts`:
- `createRoom` / `joinRoom` / `getRoomByCode` — room lifecycle
- `startGame(roomId, trackIds[])` — sets status=playing, stores shuffled track list
- `submitGuess(roomId, trackIdx, playerId, year)` — upserts to `room_guesses`
- `advanceTrack(roomId, total, currentIdx)` — increments `current_track_idx` or sets status=ended
- `resetRoom(roomId)` — rematch: clears guesses, resets to waiting
- `deleteRoom(roomId)` — host leaves lobby: cascades to room_players

Realtime hooks: `useRoom`, `useRoomPlayers`, `useRoomGuesses` subscribe via postgres_changes. All three tables have `REPLICA IDENTITY FULL` so UPDATE/DELETE filters work correctly.

Disconnect handling: 60 s turn timer auto-submits for any player who disconnects during a round. Host dropping in waiting room deletes the room (cascade). Host dropping during reveal triggers an 8 s escape timer that redirects others to `/online`.

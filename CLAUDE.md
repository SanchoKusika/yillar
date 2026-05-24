# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Branch context:** `chore/mobile` — React Native + Expo SDK 56 (Android). The web version (React + Vite + PWA) lives on the `dev` branch. Both branches share the same Supabase backend.

## Commands

```bash
# Development
npx expo start --android          # start Metro bundler + open in Android emulator
npx expo start                    # start with platform selector

# Bundle check (no device needed)
npx expo export --platform android --no-minify   # verify Hermes compilation

# EAS Build
eas build --profile preview --platform android   # internal APK
eas build --profile production --platform android # AAB for Play Store

# Track data management (Supabase — shared with web)
npm run import:tracks         # import tracks to Supabase
npm run import:tracks:reset   # reset & reimport
npm run import:tracks:dry     # dry run
```

There are no test commands — the project has no test suite.

## Environment

Copy `.env.example` → `.env` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Without these keys the app runs in **DEMO MODE** (no auth, no history saving). `supabase` client is `null` in demo mode — all DB calls guard with `if (!supabase) return`.

## Architecture

**Feature-Sliced Design (FSD)** adapted for expo-router: `app/` holds file-based routes, `src/features/` holds UI logic, `src/entities/` holds business logic, `src/shared/` holds the design system and utilities. Imports flow strictly downward.

### Path aliases

| Alias       | Path           |
| ----------- | -------------- |
| `@shared`   | `src/shared`   |
| `@entities` | `src/entities` |
| `@features` | `src/features` |
| `@theme`    | `src/theme`    |
| `@theme/*`  | `src/theme/*`  |

Configured in `tsconfig.json` (paths) and `babel.config.js` (module-resolver).

### State management

- **`useGameStore`** (Zustand, not persisted) — primary game state: players, tracks, current turn, placements, scores. Actions: `startGame`, `lockIn`, `skipTurn`, `advanceTurn`, `beginSave`.
- **`useSessionStore`** (Zustand, not persisted) — auth user + profile. Populated by `SessionProvider` on mount.
- **`usePreferencesStore`** (Zustand + `persist` → `AsyncStorage["yillar.preferences"]`) — theme and language. Initial language detected via `expo-localization`.

### Routes (expo-router, file-based)

| File                                      | Screen               | Notes                                          |
| ----------------------------------------- | -------------------- | ---------------------------------------------- |
| `app/index.tsx`                           | `HomePage`           | Mode select — Pass & Play vs Online            |
| `app/lobby.tsx`                           | `LobbyPage`          | Pass & Play player setup                       |
| `app/game.tsx`                            | `GamePage`           | Active turn                                    |
| `app/reveal.tsx`                          | `RevealPage`         | Post-guess reveal (Standard/Perfect/Rejected)  |
| `app/end.tsx`                             | `EndPage`            | Score summary, save to Supabase                |
| `app/online/index.tsx`                    | `OnlinePage`         | Online — create or join room                   |
| `app/online/room/[code].tsx`              | `WaitingRoomPage`    | Lobby — name, era, player list, host starts    |
| `app/online/game/[code].tsx`              | `OnlineGamePage`     | Active online turn (60 s timer)                |
| `app/online/reveal/[code]/[idx].tsx`      | `OnlineRevealPage`   | Online reveal with per-player scores table     |
| `app/online/end/[code].tsx`               | `OnlineEndPage`      | Online final leaderboard, rematch/home         |
| `app/auth.tsx`                            | `AuthPage`           | Sign-in / sign-up / forgot-password            |
| `app/profile.tsx`                         | `ProfilePage`        | Stats, settings                                |
| `app/reset-password.tsx`                  | `ResetPasswordPage`  | Handles `PASSWORD_RECOVERY` deep link          |

### Game flow

`/` → `/lobby` → `/game` → `/reveal` → back to `/game` or `/end`

Each turn: player guesses year via `@react-native-community/slider` (min=1960 max=2025) in `Timeline` → `lockIn()` or `skipTurn()` → Placement created → reveal screen → `advanceTurn()`.

Reveal variants from the last placement: `skipped` → `RevealRejected`, `delta === 0` → `RevealPerfect`, otherwise → `RevealStandard`.

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

`useYouTubeAudio(videoId)` wraps `react-native-youtube-iframe`. Key design decision: `InnerPlayer` is a `forwardRef` component that holds its own `play` and `videoId` state and exposes an imperative API via `useImperativeHandle`. This makes `PlayerHost` stable with zero deps — the YouTube WebView never remounts during gameplay (remounting destroys the WebView). The hook controls the player imperatively via the ref.

`<audio.PlayerHost />` is rendered in `GamePage` and `OnlineGamePage`.

### Haptic

`haptic(type)` in `src/shared/lib/haptic.ts` calls `expo-haptics`. Silently no-ops on devices without haptic engines.

### Eras

Three eras in `src/shared/lib/era.ts`:

- `klassika` — 1960–1989
- `kasseta` — 1990–1999
- `tsifra` — 2000+

`eraColor(era, key)` returns hex strings from the palette (replaces web's `eraVar()` which returned CSS variables). `ERA_COLORS` in `src/theme/tokens.ts` is the canonical palette used in components.

### Styling

- **`StyleSheet.create()` + `src/theme/tokens.ts`** — all styles are static objects with explicit pixel values
- **`ThemeProvider`** (React Context) — exposes `{ theme, colors }`. `colors` is the resolved `DARK_COLORS` or `LIGHT_COLORS` object. Components call `useTheme()`.
- `SongCard` uses hardcoded `#1A1208` / `#F5EFE0` (not theme colors) so it stays dark-text-on-cream in both themes — intentional, mirrors the web version.
- No CSS Modules, no Tailwind, no CSS variables.

### i18n

`useT()` hook → returns `t(key, params?)`. All translation keys are a union type — typos cause compile errors. Translations: `src/shared/lib/i18n/translations.ts`. Language stored in `usePreferencesStore`. Initial language detected via `expo-localization` (`Localization.getLocales()[0].languageCode`).

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

Cross-screen score passing (reveal → game): `sessionStore` in `src/shared/lib/sessionStore.ts` — an in-memory Map that replaces web's `sessionStorage`.

Disconnect handling: 60 s turn timer auto-submits for any player who disconnects during a round. Host dropping in waiting room deletes the room (cascade). Host dropping during reveal triggers an 8 s escape timer that redirects others to `/online`.

### Metro / bundler notes

**Critical:** `metro.config.js` sets `unstable_enablePackageExports: false`. This forces Metro to use the `main` (CJS) field of `@supabase/supabase-js` instead of the ESM `exports` entry. The ESM build uses `import(OTEL_PKG)` (variable dynamic import) that Hermes cannot compile. Without this flag the bundle fails.

SVG files are transformed to React components via `react-native-svg-transformer` (configured in `metro.config.js` — removes `svg` from `assetExts`, adds it to `sourceExts`).

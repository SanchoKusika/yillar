import { create } from "zustand";
import type { Era } from "@shared/lib";
import { calcScore, CORRECT_THRESHOLD_YEARS } from "@shared/lib";
import type { Player } from "@entities/player";
import type { Track } from "@entities/track";
import type { Placement } from "@entities/placement";

export type GameStatus = "lobby" | "playing" | "reveal" | "ended";

type State = {
  players: Player[];
  tracks: Track[];
  totalCards: number;
  currentCardIdx: number;
  currentPlayerIdx: number;
  status: GameStatus;
  currentGuess: number | null;
  placements: Record<string, Placement[]>;
  scores: Record<string, number>;
  savedGameId: string | null;
  saveStarted: boolean;
};

type Actions = {
  setPlayerName: (idx: number, name: string) => void;
  setPlayerEra: (idx: number, era: Era) => void;
  startGame: (tracks: Track[]) => void;
  setGuess: (year: number) => void;
  lockIn: () => Placement | null;
  skipTurn: () => Placement | null;
  advanceTurn: () => void;
  beginSave: () => boolean;
  markGameSaved: (gameId: string) => void;
  resetSaveFlag: () => void;
  reset: () => void;
};

const blankPlayer = (idx: number): Player => ({
  id: `p${idx}`,
  name: "",
  era: null,
});

const initialState: State = {
  players: [blankPlayer(0), blankPlayer(1), blankPlayer(2), blankPlayer(3)],
  tracks: [],
  totalCards: 0,
  currentCardIdx: 0,
  currentPlayerIdx: 0,
  status: "lobby",
  currentGuess: null,
  placements: {},
  scores: {},
  savedGameId: null,
  saveStarted: false,
};

export const useGameStore = create<State & Actions>((set, get) => ({
  ...initialState,

  setPlayerName: (idx, name) =>
    set((s) => {
      const players = s.players.slice();
      players[idx] = { ...players[idx], name: name.toUpperCase().slice(0, 12) };
      return { players };
    }),

  setPlayerEra: (idx, era) =>
    set((s) => {
      const players = s.players.slice();
      players[idx] = { ...players[idx], era };
      return { players };
    }),

  startGame: (tracks) =>
    set((s) => {
      const active = s.players.filter((p) => p.name);
      return {
        status: "playing",
        tracks,
        totalCards: tracks.length,
        currentCardIdx: 0,
        currentPlayerIdx: s.players.findIndex((p) => p.name),
        currentGuess: null,
        placements: Object.fromEntries(active.map((p) => [p.id, []])),
        scores: Object.fromEntries(active.map((p) => [p.id, 0])),
        savedGameId: null,
        saveStarted: false,
      };
    }),

  setGuess: (year) => set({ currentGuess: year }),

  lockIn: () => {
    const s = get();
    const track = s.tracks[s.currentCardIdx];
    const player = s.players[s.currentPlayerIdx];
    if (!track || !player?.era || s.currentGuess == null) return null;

    const result = calcScore({ guess: s.currentGuess, truth: track.year, playerEra: player.era });
    const placement: Placement = {
      trackId: track.id,
      guess: s.currentGuess,
      truth: track.year,
      delta: result.delta,
      base: result.base,
      multiplier: result.multiplier,
      bonus: result.bonus,
      points: result.points,
      era: track.era,
      title: track.title,
      artist: track.artist,
      correct: result.delta <= CORRECT_THRESHOLD_YEARS,
    };

    set({
      placements: { ...s.placements, [player.id]: [...(s.placements[player.id] ?? []), placement] },
      scores: { ...s.scores, [player.id]: (s.scores[player.id] ?? 0) + result.points },
      status: "reveal",
    });
    return placement;
  },

  skipTurn: () => {
    const s = get();
    const track = s.tracks[s.currentCardIdx];
    const player = s.players[s.currentPlayerIdx];
    if (!track || !player) return null;

    const placement: Placement = {
      trackId: track.id,
      guess: 0,
      truth: track.year,
      delta: 0,
      base: 0,
      multiplier: 1,
      bonus: 0,
      points: 0,
      era: track.era,
      title: track.title,
      artist: track.artist,
      correct: false,
      skipped: true,
    };

    set({
      placements: { ...s.placements, [player.id]: [...(s.placements[player.id] ?? []), placement] },
      status: "reveal",
    });
    return placement;
  },

  advanceTurn: () =>
    set((s) => {
      const nextCardIdx = s.currentCardIdx + 1;
      if (nextCardIdx >= s.totalCards) return { status: "ended" };

      const activeIds = s.players.filter((p) => p.name && p.era).map((p) => p.id);
      const currentId = s.players[s.currentPlayerIdx].id;
      const activePos = activeIds.indexOf(currentId);
      const nextId = activeIds[(activePos + 1) % activeIds.length];
      const nextPlayerIdx = s.players.findIndex((p) => p.id === nextId);

      return {
        status: "playing",
        currentCardIdx: nextCardIdx,
        currentPlayerIdx: nextPlayerIdx,
        currentGuess: null,
      };
    }),

  beginSave: () => {
    if (get().saveStarted) return false;
    set({ saveStarted: true });
    return true;
  },

  markGameSaved: (gameId) => set({ savedGameId: gameId }),

  resetSaveFlag: () => set({ saveStarted: false }),

  reset: () => set(initialState),
}));

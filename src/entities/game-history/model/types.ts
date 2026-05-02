import type { Era } from "@shared/lib";

export type GameHistoryEntry = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  totalCards: number;
  hostScore: number;
  hostRank: number | null;
  isWinner: boolean;
  hostGeneration: Era | null;
  playerCount: number;
};

export type EraBreakdownEntry = {
  era: Era;
  correct: number;
  total: number;
};

export type BestDecade = {
  decade: number;
  correct: number;
  total: number;
  accuracy: number;
};

export type ProfileStats = {
  gamesPlayed: number;
  bestScore: number | null;
  averageScore: number | null;
  wins: number;
  eraBreakdown: EraBreakdownEntry[];
  bestDecade: BestDecade | null;
};

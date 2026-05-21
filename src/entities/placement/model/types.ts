import type { Era } from "@shared/lib";

export type Placement = {
  trackId: string;
  guess: number;
  truth: number;
  delta: number;
  base: number;
  multiplier: number;
  bonus: number;
  points: number;
  era: Era;
  title: string;
  artist: string;
  correct: boolean;
  skipped?: boolean;
};

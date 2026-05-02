import type { Era } from "./era";
import { eraForYear } from "./era";

export const MAX_BASE = 10;
export const ERA_BONUS_MULTIPLIER = 3;
export const EXACT_BONUS = 20;
export const CORRECT_THRESHOLD_YEARS = 5;

export type ScoreResult = {
  delta: number;
  base: number;
  multiplier: number;
  bonus: number;
  points: number;
};

export function calcScore(args: {
  guess: number;
  truth: number;
  playerEra: Era;
}): ScoreResult {
  const delta = Math.abs(args.truth - args.guess);
  const base = Math.max(0, MAX_BASE - delta);
  const trackEra = eraForYear(args.truth);
  const multiplier = trackEra === args.playerEra ? ERA_BONUS_MULTIPLIER : 1;
  const bonus = delta === 0 ? EXACT_BONUS : 0;
  const points = base * multiplier + bonus;
  return { delta, base, multiplier, bonus, points };
}

import { supabase } from "@shared/api";
import { ERAS, type Era } from "@shared/lib";
import type { BestDecade, EraBreakdownEntry, GameHistoryEntry, ProfileStats } from "../model/types";

type GameRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  total_cards: number;
  game_players: Array<{
    user_id: string | null;
    total_score: number;
    rank: number | null;
    is_winner: boolean;
    generation: Era | null;
  }>;
};

type PlacementRow = {
  track_id: string | null;
  era: Era;
  correct: boolean;
  truth_year: number;
};

type TrackCountRow = {
  era: Era;
};

export async function fetchHistory(userId: string, limit = 10): Promise<GameHistoryEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("games")
    .select(
      "id, started_at, ended_at, total_cards, game_players(user_id, total_score, rank, is_winner, generation)",
    )
    .eq("host_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  return (data as GameRow[]).map((g) => {
    const host = g.game_players.find((p) => p.user_id === userId);
    return {
      id: g.id,
      startedAt: g.started_at,
      endedAt: g.ended_at,
      totalCards: g.total_cards,
      hostScore: host?.total_score ?? 0,
      hostRank: host?.rank ?? null,
      isWinner: host?.is_winner ?? false,
      hostGeneration: host?.generation ?? null,
      playerCount: g.game_players.length,
    };
  });
}

const EMPTY_STATS: ProfileStats = {
  gamesPlayed: 0,
  bestScore: null,
  averageScore: null,
  wins: 0,
  eraBreakdown: ERAS.map((era) => ({ era, correct: 0, total: 0 })),
  bestDecade: null,
};

async function fetchCatalogTotals(): Promise<Record<Era, number>> {
  const totals: Record<Era, number> = { klassika: 0, kasseta: 0, tsifra: 0 };
  if (!supabase) return totals;
  const { data, error } = await supabase.from("tracks").select("era");
  if (error) throw error;
  for (const row of (data ?? []) as TrackCountRow[]) {
    if (row.era in totals) totals[row.era] += 1;
  }
  return totals;
}

export async function fetchStats(userId: string): Promise<ProfileStats> {
  if (!supabase) return EMPTY_STATS;

  const { data: players, error: playersErr } = await supabase
    .from("game_players")
    .select("id, total_score, is_winner")
    .eq("user_id", userId);
  if (playersErr) throw playersErr;

  const rows = players ?? [];

  const catalogTotals = await fetchCatalogTotals();

  const baseEra: EraBreakdownEntry[] = ERAS.map((era) => ({
    era,
    correct: 0,
    total: catalogTotals[era],
  }));

  if (rows.length === 0) {
    return { ...EMPTY_STATS, eraBreakdown: baseEra };
  }

  const playerIds = rows.map((r) => r.id as string);
  const scores = rows.map((r) => r.total_score as number);

  const { data: placementsData, error: plErr } = await supabase
    .from("placements")
    .select("track_id, era, correct, truth_year")
    .in("game_player_id", playerIds);
  if (plErr) throw plErr;

  const placements = (placementsData ?? []) as PlacementRow[];

  const guessedTrackIdsByEra = new Map<Era, Set<string>>(
    ERAS.map((era) => [era, new Set<string>()]),
  );
  const decadeMap = new Map<number, { correct: number; total: number }>();

  for (const p of placements) {
    if (p.correct && p.track_id) {
      guessedTrackIdsByEra.get(p.era)?.add(p.track_id);
    }
    const decade = Math.floor(p.truth_year / 10) * 10;
    const dec = decadeMap.get(decade) ?? { correct: 0, total: 0 };
    dec.total += 1;
    if (p.correct) dec.correct += 1;
    decadeMap.set(decade, dec);
  }

  let bestDecade: BestDecade | null = null;
  for (const [decade, { correct, total }] of decadeMap) {
    if (total < 3) continue;
    const accuracy = correct / total;
    if (!bestDecade || accuracy > bestDecade.accuracy) {
      bestDecade = { decade, correct, total, accuracy };
    }
  }

  const eraBreakdown: EraBreakdownEntry[] = ERAS.map((era) => ({
    era,
    correct: guessedTrackIdsByEra.get(era)?.size ?? 0,
    total: catalogTotals[era],
  }));

  return {
    gamesPlayed: rows.length,
    bestScore: Math.max(...scores),
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / rows.length),
    wins: rows.filter((r) => r.is_winner).length,
    eraBreakdown,
    bestDecade,
  };
}

import { supabase } from "@shared/api";
import type { Era } from "@shared/lib";
import type { Placement } from "@entities/placement";

export type SaveGameInput = {
  hostId: string;
  totalCards: number;
  players: Array<{
    displayName: string;
    generation: Era | null;
    totalScore: number;
    rank: number;
    isWinner: boolean;
    isHost: boolean;
    placements: Placement[];
  }>;
};

export async function saveGame(input: SaveGameInput): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data: gameRow, error: gameErr } = await supabase
    .from("games")
    .insert({
      host_id: input.hostId,
      status: "ended",
      total_cards: input.totalCards,
      ended_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (gameErr) throw gameErr;
  const gameId = gameRow.id as string;

  for (const p of input.players) {
    const { data: gpRow, error: gpErr } = await supabase
      .from("game_players")
      .insert({
        game_id: gameId,
        user_id: p.isHost ? input.hostId : null,
        guest_name: p.isHost ? null : p.displayName,
        display_name: p.displayName,
        generation: p.generation,
        total_score: p.totalScore,
        rank: p.rank,
        is_winner: p.isWinner,
      })
      .select("id")
      .single();
    if (gpErr) throw gpErr;
    const gamePlayerId = gpRow.id as string;

    if (p.placements.length > 0) {
      const rows = p.placements.map((pl, idx) => ({
        game_id: gameId,
        game_player_id: gamePlayerId,
        track_id: isUuid(pl.trackId) ? pl.trackId : null,
        card_idx: idx,
        guess_year: pl.guess,
        truth_year: pl.truth,
        delta: pl.delta,
        base: pl.base,
        multiplier: pl.multiplier,
        points: pl.points,
        era: pl.era,
        correct: pl.correct,
      }));
      const { error: plErr } = await supabase.from("placements").insert(rows);
      if (plErr) throw plErr;
    }
  }

  return gameId;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

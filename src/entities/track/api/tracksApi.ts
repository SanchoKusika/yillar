import { supabase } from "@shared/api";
import { DEMO_TRACKS } from "@shared/config";
import type { Era } from "@shared/lib";
import type { Track } from "../model/types";

type TrackRow = {
  id: string;
  youtube_id: string;
  artist: string;
  title: string;
  year: number;
  era: Era;
};

const fromRow = (r: TrackRow): Track => ({
  id: r.id,
  youtubeId: r.youtube_id,
  artist: r.artist,
  title: r.title,
  year: r.year,
  era: r.era,
});

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FETCH_TIMEOUT_MS = 8000;

export async function getTrackById(id: string): Promise<Track | null> {
  if (!supabase) {
    return DEMO_TRACKS.find((t) => t.id === id) ?? null;
  }
  const { data } = await supabase
    .from("tracks")
    .select("id, youtube_id, artist, title, year, era")
    .eq("id", id)
    .single<TrackRow>();
  return data ? fromRow(data) : null;
}

export async function getTracks(limit = 12): Promise<Track[]> {
  if (!supabase) {
    console.warn("[YILLAR] supabase client not initialised — DEMO catalog");
    return shuffle(DEMO_TRACKS).slice(0, limit);
  }

  const query = supabase
    .from("tracks")
    .select("id, youtube_id, artist, title, year, era")
    .eq("active", true);

  const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
    setTimeout(() => resolve({ data: null, error: new Error("tracks request timed out") }), FETCH_TIMEOUT_MS),
  );

  const { data, error } = await Promise.race([query, timeout]);

  if (error) {
    console.warn("[YILLAR] tracks fetch failed, falling back to DEMO:", error.message);
    return shuffle(DEMO_TRACKS).slice(0, limit);
  }
  if (!data || data.length === 0) return shuffle(DEMO_TRACKS).slice(0, limit);
  return shuffle(data as TrackRow[]).slice(0, limit).map(fromRow);
}

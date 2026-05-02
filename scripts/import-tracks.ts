import { config as loadEnv } from "dotenv";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

type Era = "klassika" | "kasseta" | "tsifra";
type TrackInput = { artist: string; title: string; era: Era; year: number };
type CachedTrack = TrackInput & { youtube_id: string };

const ARGS = new Set(process.argv.slice(2));
const RESET = ARGS.has("--reset");
const DRY = ARGS.has("--dry");
const FROM_CACHE = ARGS.has("--from-cache");

const YT_API = "https://www.googleapis.com/youtube/v3";
const INPUT_PATH = resolve(process.cwd(), "scripts/uzbek-tracks.json");
const CACHE_PATH = resolve(process.cwd(), "scripts/tracks-cache.json");

function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ Missing env ${name}. Add it to .env.local`);
    process.exit(1);
  }
  return v;
}

const SUPABASE_URL = need("VITE_SUPABASE_URL").replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE = need("SUPABASE_SERVICE_ROLE_KEY");
const YT_API_KEY = FROM_CACHE ? "" : need("YT_API_KEY");

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type SearchItem = { id: { videoId: string }; snippet: { title: string; channelTitle: string } };
type VideoStatus = {
  id: string;
  status: { embeddable: boolean; privacyStatus: string };
  contentDetails: { regionRestriction?: { blocked?: string[]; allowed?: string[] } };
};

async function ytSearch(q: string): Promise<SearchItem[]> {
  const url = new URL(`${YT_API}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "5");
  url.searchParams.set("q", q);
  url.searchParams.set("relevanceLanguage", "uz");
  url.searchParams.set("key", YT_API_KEY);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`search ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as { items?: SearchItem[] };
  return j.items ?? [];
}

async function ytStatus(ids: string[]): Promise<VideoStatus[]> {
  if (ids.length === 0) return [];
  const url = new URL(`${YT_API}/videos`);
  url.searchParams.set("part", "status,contentDetails");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("key", YT_API_KEY);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`videos ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as { items?: VideoStatus[] };
  return j.items ?? [];
}

async function pickPlayable(t: TrackInput, used: Set<string>): Promise<string | null> {
  const candidates = await ytSearch(`${t.artist} ${t.title} o'zbek`);
  if (candidates.length === 0) return null;

  const statuses = await ytStatus(candidates.map((c) => c.id.videoId));
  const byId = new Map(statuses.map((s) => [s.id, s]));

  for (const c of candidates) {
    const id = c.id.videoId;
    if (used.has(id)) continue;
    const st = byId.get(id);
    if (!st) continue;
    if (!st.status.embeddable) continue;
    if (st.status.privacyStatus !== "public") continue;
    if (st.contentDetails.regionRestriction?.blocked?.length) continue;
    return id;
  }
  return null;
}

async function maybeReset() {
  if (!RESET) return;
  console.log("⚠  --reset: deleting all rows from tracks");
  const { error } = await sb.from("tracks").delete().not("id", "is", null);
  if (error) {
    console.error("  failed:", error.message);
    process.exit(1);
  }
}

async function findExistingId(artist: string, title: string): Promise<string | null> {
  const { data, error } = await sb
    .from("tracks")
    .select("id")
    .eq("artist", artist)
    .eq("title", title)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertTrack(t: CachedTrack) {
  const existingId = await findExistingId(t.artist, t.title);
  const row = {
    artist: t.artist,
    title: t.title,
    era: t.era,
    year: t.year,
    youtube_id: t.youtube_id,
    active: true,
  };
  if (existingId) {
    const { error } = await sb.from("tracks").update(row).eq("id", existingId);
    if (error) throw error;
  } else {
    const { error } = await sb.from("tracks").insert(row);
    if (error) throw error;
  }
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function runFromCache() {
  const raw = await readFile(CACHE_PATH, "utf8");
  const cache = JSON.parse(raw) as CachedTrack[];
  console.log(`Loading ${cache.length} tracks from cache (no YouTube API calls)`);

  if (DRY) {
    cache.forEach((t, i) =>
      console.log(`✓ [${String(i + 1).padStart(2, "0")}/${cache.length}] ${t.era.toUpperCase().slice(0, 5)} · ${t.artist} — ${t.title} → ${t.youtube_id}  (DRY)`),
    );
    return;
  }

  await maybeReset();

  let ok = 0;
  let skipped = 0;
  for (let i = 0; i < cache.length; i++) {
    const t = cache[i];
    const tag = `[${String(i + 1).padStart(2, "0")}/${cache.length}] ${t.era.toUpperCase().slice(0, 5)} · ${t.artist} — ${t.title}`;
    try {
      await upsertTrack(t);
      console.log(`✓ ${tag} → ${t.youtube_id}`);
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ ${tag} (${msg})`);
      skipped++;
    }
  }
  console.log(`\nDone (cache). ok=${ok}, skipped=${skipped}, total=${cache.length}`);
}

async function runFromYouTube() {
  const raw = await readFile(INPUT_PATH, "utf8");
  const list = JSON.parse(raw) as TrackInput[];
  console.log(`Tracks to import: ${list.length}${RESET ? " (with --reset)" : ""}${DRY ? " (DRY run)" : ""}`);

  if (!DRY) await maybeReset();

  const used = new Set<string>();
  let ok = 0;
  let skipped = 0;
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    const tag = `[${String(i + 1).padStart(2, "0")}/${list.length}] ${t.era.toUpperCase().slice(0, 5)} · ${t.artist} — ${t.title}`;
    try {
      const videoId = await pickPlayable(t, used);
      if (!videoId) {
        console.log(`✗ ${tag} (no embeddable / unique result)`);
        skipped++;
        continue;
      }
      used.add(videoId);
      if (DRY) {
        console.log(`✓ ${tag} → ${videoId}  (DRY, not written)`);
      } else {
        await upsertTrack({ ...t, youtube_id: videoId });
        console.log(`✓ ${tag} → ${videoId}`);
      }
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ ${tag} (${msg})`);
      skipped++;
    }
    await sleep(150);
  }

  console.log(`\nDone. ok=${ok}, skipped=${skipped}, total=${list.length}`);
}

async function main() {
  if (FROM_CACHE) {
    await runFromCache();
  } else {
    await runFromYouTube();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

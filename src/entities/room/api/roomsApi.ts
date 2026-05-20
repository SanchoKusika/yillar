import { supabase } from "@shared/api";
import type { Era } from "@shared/lib";
import { mapRoom, mapRoomGuess, mapRoomPlayer, type RawRoom, type RawRoomGuess, type RawRoomPlayer, type Room, type RoomGuess, type RoomPlayer } from "../model/types";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  return Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

export async function createRoom(hostId: string, initialName: string): Promise<Room> {
  if (!supabase) throw new Error("no-supabase");

  const code = generateCode();

  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .insert({ code, host_id: hostId })
    .select()
    .single<RawRoom>();

  if (roomErr) throw roomErr;

  const { error: playerErr } = await supabase.from("room_players").insert({
    room_id: room.id,
    player_id: hostId,
    name: initialName,
    is_host: true,
  });

  if (playerErr) throw playerErr;

  return mapRoom(room);
}

export async function joinRoom(code: string, playerId: string, initialName: string): Promise<Room> {
  if (!supabase) throw new Error("no-supabase");

  const { data: room, error: findErr } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .maybeSingle<RawRoom>();

  if (findErr || !room) throw new Error("room-not-found");
  if (room.status !== "waiting") throw new Error("room-full");

  const { error: playerErr } = await supabase.from("room_players").upsert(
    { room_id: room.id, player_id: playerId, name: initialName, is_host: false },
    { onConflict: "room_id,player_id" }
  );

  if (playerErr) throw playerErr;

  return mapRoom(room);
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  if (!supabase) return null;

  const { data } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .maybeSingle<RawRoom>();

  return data ? mapRoom(data) : null;
}

export async function getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from("room_players")
    .select()
    .eq("room_id", roomId)
    .order("joined_at");

  return (data ?? []).map((r) => mapRoomPlayer(r as RawRoomPlayer));
}

export async function updateRoomPlayer(
  roomId: string,
  playerId: string,
  patch: { name?: string; era?: Era | null }
): Promise<void> {
  if (!supabase) return;

  await supabase
    .from("room_players")
    .update(patch)
    .eq("room_id", roomId)
    .eq("player_id", playerId);
}

export async function startGame(roomId: string, trackIds: string[]): Promise<void> {
  if (!supabase) return;

  await supabase
    .from("rooms")
    .update({ status: "playing", track_ids: trackIds })
    .eq("id", roomId);
}

export async function ensureInRoom(roomId: string, playerId: string, initialName: string): Promise<void> {
  if (!supabase) return;

  await supabase
    .from("room_players")
    .upsert(
      { room_id: roomId, player_id: playerId, name: initialName, is_host: false },
      { onConflict: "room_id,player_id", ignoreDuplicates: true }
    );
}

export async function submitGuess(
  roomId: string,
  trackIdx: number,
  playerId: string,
  guessYear: number
): Promise<void> {
  if (!supabase) return;
  await supabase.from("room_guesses").upsert(
    { room_id: roomId, track_idx: trackIdx, player_id: playerId, guess_year: guessYear },
    { onConflict: "room_id,track_idx,player_id" }
  );
}

export async function getRoomGuesses(roomId: string, trackIdx?: number): Promise<RoomGuess[]> {
  if (!supabase) return [];
  let q = supabase.from("room_guesses").select().eq("room_id", roomId);
  if (trackIdx !== undefined) q = q.eq("track_idx", trackIdx);
  const { data } = await q.order("submitted_at");
  return (data ?? []).map((r) => mapRoomGuess(r as RawRoomGuess));
}

export async function advanceTrack(roomId: string, totalTracks: number, currentIdx: number): Promise<void> {
  if (!supabase) return;
  const next = currentIdx + 1;
  if (next >= totalTracks) {
    await supabase.from("rooms").update({ status: "ended" }).eq("id", roomId);
  } else {
    await supabase.from("rooms").update({ current_track_idx: next }).eq("id", roomId);
  }
}

export async function leaveRoom(roomId: string, playerId: string): Promise<void> {
  if (!supabase) return;

  await supabase
    .from("room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("player_id", playerId);
}

export async function deleteRoom(roomId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("rooms").delete().eq("id", roomId);
}

export async function resetRoom(roomId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("room_guesses").delete().eq("room_id", roomId);
  await supabase
    .from("rooms")
    .update({ status: "waiting", current_track_idx: 0, track_ids: [] })
    .eq("id", roomId);
}

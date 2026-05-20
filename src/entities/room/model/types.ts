import type { Era } from "@shared/lib";

export type RoomStatus = "waiting" | "playing" | "ended";

export type Room = {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  trackIds: string[];
  currentTrackIdx: number;
  createdAt: string;
  updatedAt: string;
};

export type RoomPlayer = {
  id: string;
  roomId: string;
  playerId: string;
  name: string;
  era: Era | null;
  isHost: boolean;
  joinedAt: string;
};

export type RawRoom = {
  id: string;
  code: string;
  host_id: string;
  status: RoomStatus;
  track_ids: string[];
  current_track_idx: number;
  created_at: string;
  updated_at: string;
};

export type RawRoomPlayer = {
  id: string;
  room_id: string;
  player_id: string;
  name: string;
  era: Era | null;
  is_host: boolean;
  joined_at: string;
};

export function mapRoom(r: RawRoom): Room {
  return {
    id: r.id,
    code: r.code,
    hostId: r.host_id,
    status: r.status,
    trackIds: r.track_ids,
    currentTrackIdx: r.current_track_idx,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export type RoomGuess = {
  id: string;
  roomId: string;
  trackIdx: number;
  playerId: string;
  guessYear: number;
  submittedAt: string;
};

export type RawRoomGuess = {
  id: string;
  room_id: string;
  track_idx: number;
  player_id: string;
  guess_year: number;
  submitted_at: string;
};

export function mapRoomGuess(r: RawRoomGuess): RoomGuess {
  return {
    id: r.id,
    roomId: r.room_id,
    trackIdx: r.track_idx,
    playerId: r.player_id,
    guessYear: r.guess_year,
    submittedAt: r.submitted_at,
  };
}

export function mapRoomPlayer(r: RawRoomPlayer): RoomPlayer {
  return {
    id: r.id,
    roomId: r.room_id,
    playerId: r.player_id,
    name: r.name,
    era: r.era,
    isHost: r.is_host,
    joinedAt: r.joined_at,
  };
}

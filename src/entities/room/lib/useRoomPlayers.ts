import { useEffect, useRef, useState } from "react";
import { supabase } from "@shared/api";
import { getRoomPlayers } from "../api/roomsApi";
import { mapRoomPlayer, type RawRoomPlayer, type RoomPlayer } from "../model/types";

const POLL_INTERVAL_MS = 3000;

export function useRoomPlayers(roomId: string | null): RoomPlayer[] {
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const playersRef = useRef<RoomPlayer[]>([]);

  useEffect(() => {
    if (!roomId || !supabase) return;

    let active = true;

    const applyList = (list: RoomPlayer[]) => {
      playersRef.current = list;
      setPlayers(list);
    };

    getRoomPlayers(roomId).then((list) => {
      if (active) applyList(list);
    });

    // Polling fallback: Supabase Realtime may not deliver INSERT events to the
    // host when a self-referential RLS policy (0006) is in effect and the
    // subscriber's JWT hasn't been propagated to the Realtime server yet.
    const pollId = setInterval(() => {
      getRoomPlayers(roomId).then((list) => {
        if (!active) return;
        const prev = playersRef.current;
        const changed =
          list.length !== prev.length ||
          list.some((p, i) => p.id !== prev[i]?.id || p.name !== prev[i]?.name || p.era !== prev[i]?.era);
        if (changed) applyList(list);
      });
    }, POLL_INTERVAL_MS);

    const channel = supabase
      .channel(`room_players:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!active) return;
          if (payload.eventType === "INSERT") {
            const next = [...playersRef.current, mapRoomPlayer(payload.new as RawRoomPlayer)];
            applyList(next);
          } else if (payload.eventType === "UPDATE") {
            const next = playersRef.current.map((p) =>
              p.id === (payload.new as RawRoomPlayer).id
                ? mapRoomPlayer(payload.new as RawRoomPlayer)
                : p
            );
            applyList(next);
          } else if (payload.eventType === "DELETE") {
            const next = playersRef.current.filter((p) => p.id !== (payload.old as { id: string }).id);
            applyList(next);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      clearInterval(pollId);
      void supabase!.removeChannel(channel);
    };
  }, [roomId]);

  return players;
}

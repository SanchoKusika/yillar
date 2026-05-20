import { useEffect, useState } from "react";
import { supabase } from "@shared/api";
import { getRoomPlayers } from "../api/roomsApi";
import { mapRoomPlayer, type RawRoomPlayer, type RoomPlayer } from "../model/types";

export function useRoomPlayers(roomId: string | null): RoomPlayer[] {
  const [players, setPlayers] = useState<RoomPlayer[]>([]);

  useEffect(() => {
    if (!roomId || !supabase) return;

    let active = true;

    getRoomPlayers(roomId).then((list) => {
      if (active) setPlayers(list);
    });

    const channel = supabase
      .channel(`room_players:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!active) return;
          if (payload.eventType === "INSERT") {
            setPlayers((prev) => [...prev, mapRoomPlayer(payload.new as RawRoomPlayer)]);
          } else if (payload.eventType === "UPDATE") {
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === (payload.new as RawRoomPlayer).id
                  ? mapRoomPlayer(payload.new as RawRoomPlayer)
                  : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            setPlayers((prev) => prev.filter((p) => p.id !== (payload.old as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase!.removeChannel(channel);
    };
  }, [roomId]);

  return players;
}

import { useEffect, useState } from "react";
import { supabase } from "@shared/api";
import { getRoomGuesses } from "../api/roomsApi";
import { mapRoomGuess, type RawRoomGuess, type RoomGuess } from "../model/types";

export function useRoomGuesses(roomId: string | null, trackIdx: number): RoomGuess[] {
  const [guesses, setGuesses] = useState<RoomGuess[]>([]);

  useEffect(() => {
    if (!roomId || !supabase) return;

    setGuesses([]);
    let active = true;

    getRoomGuesses(roomId, trackIdx).then((list) => {
      if (active) setGuesses(list);
    });

    const channel = supabase
      .channel(`room_guesses:${roomId}:${trackIdx}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_guesses", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!active) return;
          const g = mapRoomGuess(payload.new as RawRoomGuess);
          if (g.trackIdx === trackIdx) {
            setGuesses((prev) => {
              if (prev.some((x) => x.id === g.id)) return prev;
              return [...prev, g];
            });
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase!.removeChannel(channel);
    };
  }, [roomId, trackIdx]);

  return guesses;
}

import { useEffect, useState } from "react";
import { supabase } from "@shared/api";
import { getRoomByCode } from "../api/roomsApi";
import { mapRoom, type RawRoom, type Room } from "../model/types";

export function useRoom(code: string | null): Room | null {
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!code || !supabase) return;

    let active = true;

    getRoomByCode(code).then((r) => {
      if (active) setRoom(r);
    });

    const channel = supabase
      .channel(`room:${code}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `code=eq.${code}` },
        (payload) => {
          if (active) setRoom(mapRoom(payload.new as RawRoom));
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase!.removeChannel(channel);
    };
  }, [code]);

  return room;
}

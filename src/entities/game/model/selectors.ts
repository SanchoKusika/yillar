import { useShallow } from "zustand/react/shallow";
import type { Player } from "@entities/player";
import { useGameStore } from "./store";

export const useActivePlayers = (): Player[] =>
  useGameStore(useShallow((s) => s.players.filter((p) => p.name && p.era)));

export const useCurrentPlayer = (): Player | undefined =>
  useGameStore((s) => s.players[s.currentPlayerIdx]);

export const useCurrentTrack = () =>
  useGameStore((s) => s.tracks[s.currentCardIdx]);

export const useMyPlacements = () => {
  const playerId = useGameStore((s) => s.players[s.currentPlayerIdx]?.id);
  return useGameStore(
    useShallow((s) => (playerId ? s.placements[playerId] ?? [] : [])),
  );
};

export const useLastPlacement = () => {
  const playerId = useGameStore((s) => s.players[s.currentPlayerIdx]?.id);
  return useGameStore((s) => {
    if (!playerId) return undefined;
    const arr = s.placements[playerId];
    return arr?.[arr.length - 1];
  });
};

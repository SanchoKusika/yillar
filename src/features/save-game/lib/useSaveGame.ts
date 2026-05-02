import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveGame, type SaveGameInput } from "../api/saveGame";

export function useSaveGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveGameInput) => saveGame(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

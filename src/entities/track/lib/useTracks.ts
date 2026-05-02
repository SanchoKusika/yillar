import { useQuery } from "@tanstack/react-query";
import { getTracks } from "../api/tracksApi";

export function useTracks(limit = 12) {
  return useQuery({
    queryKey: ["tracks", limit],
    queryFn: () => getTracks(limit),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

import { useQuery } from "@tanstack/react-query";
import { fetchHistory, fetchStats } from "../api/historyApi";

export function useHistory(userId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ["games", "history", userId, limit],
    queryFn: () => fetchHistory(userId!, limit),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useProfileStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["games", "stats", userId],
    queryFn: () => fetchStats(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

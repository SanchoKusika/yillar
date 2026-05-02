import { useSessionStore } from "../model/store";

export const useIsAuthenticated = () => useSessionStore((s) => s.user !== null);
export const useIsAnonymous = () => useSessionStore((s) => s.user?.isAnonymous ?? false);
export const useDisplayName = () =>
  useSessionStore((s) => s.profile?.displayName ?? s.user?.email ?? "GUEST");

import { create } from "zustand";
import type { AuthUserSummary, Profile } from "./types";

type State = {
  user: AuthUserSummary | null;
  profile: Profile | null;
  loading: boolean;
};

type Actions = {
  setUser: (user: AuthUserSummary | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

const initialState: State = {
  user: null,
  profile: null,
  loading: true,
};

export const useSessionStore = create<State & Actions>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  reset: () => set(initialState),
}));

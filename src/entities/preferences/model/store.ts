import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Language, Theme } from "./types";

type State = {
  theme: Theme;
  language: Language;
};

type Actions = {
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
};

const detectInitialLanguage = (): Language => {
  if (typeof navigator === "undefined") return "ru";
  const code = navigator.language?.slice(0, 2).toLowerCase();
  if (code === "uz") return "uz";
  if (code === "en") return "en";
  return "ru";
};

export const usePreferencesStore = create<State & Actions>()(
  persist(
    (set) => ({
      theme: "dark",
      language: detectInitialLanguage(),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "yillar.preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, language: s.language }),
    },
  ),
);

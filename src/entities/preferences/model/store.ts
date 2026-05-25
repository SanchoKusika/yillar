import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
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
  const locales = Localization.getLocales();
  const code = locales[0]?.languageCode?.toLowerCase();
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
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ theme: s.theme, language: s.language }),
    },
  ),
);

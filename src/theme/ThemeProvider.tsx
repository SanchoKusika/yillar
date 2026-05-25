import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePreferencesStore } from "@entities/preferences/model/store";
import { DARK_COLORS, LIGHT_COLORS, type Colors } from "./tokens";

type ThemeContextValue = {
  theme: "dark" | "light";
  colors: Colors;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  colors: DARK_COLORS,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: theme === "light" ? LIGHT_COLORS : DARK_COLORS,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

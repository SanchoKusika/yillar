import { useEffect, type ReactNode } from "react";
import { usePreferencesStore } from "@entities/preferences";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    root.style.colorScheme = theme;
  }, [theme]);

  return <>{children}</>;
}

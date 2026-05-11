export type Era = "klassika" | "kasseta" | "tsifra";

export const ERAS: readonly Era[] = ["klassika", "kasseta", "tsifra"] as const;

export const ERA_LABEL: Record<Era, string> = {
  klassika: "1960–89",
  kasseta: "1990–99",
  tsifra: "2000+",
};

export function eraForYear(year: number): Era {
  if (year <= 1989) return "klassika";
  if (year <= 1999) return "kasseta";
  return "tsifra";
}

export const eraVar = (
  era: Era,
  key: "primary" | "deep" | "surface" | "surface-2" | "ink" | "accent",
) => `var(--color-${era}-${key})`;

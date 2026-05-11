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

type EraKey = "primary" | "deep" | "surface" | "surface-2" | "ink" | "accent";

const ERA_FALLBACKS: Record<Era, Record<EraKey, string>> = {
  klassika: {
    primary: "#7B3F2A",
    deep: "#4E271B",
    surface: "#EDE0C4",
    "surface-2": "#D9C89F",
    ink: "#1A1208",
    accent: "#B8763F",
  },
  kasseta: {
    primary: "#C4572A",
    deep: "#8B3A18",
    surface: "#E8C892",
    "surface-2": "#C9A86A",
    ink: "#1A1208",
    accent: "#4A8080",
  },
  tsifra: {
    primary: "#2A5C7B",
    deep: "#163A52",
    surface: "#E6EEF2",
    "surface-2": "#C4D4DC",
    ink: "#0A1218",
    accent: "#00D4E8",
  },
};

export const eraVar = (era: Era, key: EraKey) =>
  `var(--color-${era}-${key}, ${ERA_FALLBACKS[era][key]})`;

import type { Era } from "@shared/lib/era";

// ─── Colors ──────────────────────────────────────────────────────────────────

export type Colors = {
  ink: string;
  ink2: string;
  ink3: string;
  cream: string;
  cream2: string;
  cream3: string;
  paper: string;
  paperEdge: string;
  gold: string;
  goldDeep: string;
  goldGlow: string;
  redact: string;
  redactEdge: string;
  success: string;
  danger: string;
  info: string;
  warn: string;
};

export const DARK_COLORS: Colors = {
  ink: "#1A1208",
  ink2: "#2A1E10",
  ink3: "#3A2C1C",
  cream: "#F5EFE0",
  cream2: "#E8DFCA",
  cream3: "#C9BFA6",
  paper: "#F5EFE0",
  paperEdge: "rgba(26,18,8,0.18)",
  gold: "#D4A847",
  goldDeep: "#A8832F",
  goldGlow: "#E8C36A",
  redact: "#0E0804",
  redactEdge: "#D4A847",
  success: "#6B8E3D",
  danger: "#B23A3A",
  info: "#00D4E8",
  warn: "#D4A847",
};

export const LIGHT_COLORS: Colors = {
  ...DARK_COLORS,
  ink: "#F0EEE9",
  ink2: "#E6E2DA",
  ink3: "#CFC9BD",
  cream: "#1A1208",
  cream2: "#2A1E10",
  cream3: "#3A2C1C",
  paper: "#DDD6C5",
  paperEdge: "rgba(26,18,8,0.32)",
  redact: "#1A1208",
};

// ─── Era palette ─────────────────────────────────────────────────────────────

export type EraColors = {
  primary: string;
  deep: string;
  surface: string;
  surface2: string;
  ink: string;
  accent: string;
};

export const ERA_COLORS: Record<Era, EraColors> = {
  klassika: {
    primary: "#7B3F2A",
    deep: "#4E271B",
    surface: "#EDE0C4",
    surface2: "#D9C89F",
    ink: "#1A1208",
    accent: "#B8763F",
  },
  kasseta: {
    primary: "#C4572A",
    deep: "#8B3A18",
    surface: "#E8C892",
    surface2: "#C9A86A",
    ink: "#1A1208",
    accent: "#4A8080",
  },
  tsifra: {
    primary: "#2A5C7B",
    deep: "#163A52",
    surface: "#E6EEF2",
    surface2: "#C4D4DC",
    ink: "#0A1218",
    accent: "#00D4E8",
  },
};

// ─── Typography ──────────────────────────────────────────────────────────────

// Font family names must match keys passed to useFonts() in _layout.tsx.
export const fonts = {
  display: "PlayfairDisplay-Black",
  displayBold: "PlayfairDisplay-Bold",
  displayBoldItalic: "PlayfairDisplay-BoldItalic",
  body: "OpenSans-Regular",
  bodyMedium: "OpenSans-Medium",
  bodySemiBold: "OpenSans-SemiBold",
  bodyBold: "OpenSans-Bold",
  bodyExtraBold: "OpenSans-ExtraBold",
  bodyItalic: "OpenSans-Italic",
  condensed: "OpenSansCondensed-Regular",
  condensedMedium: "OpenSansCondensed-Medium",
  condensedSemiBold: "OpenSansCondensed-SemiBold",
  condensedBold: "OpenSansCondensed-Bold",
  condensedExtraBold: "OpenSansCondensed-ExtraBold",
  semiCondensed: "OpenSansSemiCondensed-Regular",
  semiCondensedSemiBold: "OpenSansSemiCondensed-SemiBold",
  semiCondensedBold: "OpenSansSemiCondensed-Bold",
  mono: "IBMPlexMono-Regular",
  monoLight: "IBMPlexMono-Light",
  monoMedium: "IBMPlexMono-Medium",
  monoSemiBold: "IBMPlexMono-SemiBold",
  monoBold: "IBMPlexMono-Bold",
} as const;

// Fixed sizes for phone (replacing clamp() from CSS):
// - display: clamp(44,7vw,80) → 48 on 430px phone
// - yearLg: clamp(64,10vw,120) → 64 (min at mobile)
// - yearXl: clamp(80,16vw,180) → 80 (min at mobile)
export const fontSizes = {
  tiny: 11,
  small: 13,
  body: 15,
  h3: 18,
  h2: 24,
  h1: 32,
  display: 48,
  yearLg: 72,
  yearXl: 96,
  score: 22,
} as const;

// ─── Spacing helpers ──────────────────────────────────────────────────────────

// RN letterSpacing is absolute px (not em). tracking(0.18, 13) → 2.34px
export const tracking = (em: number, fontSize: number): number => em * fontSize;

// RN lineHeight is absolute px (not a ratio). leading(1.1, 18) → 19.8px
export const leading = (ratio: number, fontSize: number): number => ratio * fontSize;

export const lineHeights = {
  display: 0.95,
  tight: 1.1,
  body: 1.45,
} as const;

export const letterSpacings = {
  era: 0.18,      // multiply by fontSize
  label: 0.08,
  tight: -0.02,
  mono: 0,
} as const;

// ─── Easing (for Reanimated Easing.bezier) ───────────────────────────────────

export const easings = {
  // cubic-bezier(0.2, 0.8, 0.2, 1) — снаппи, механический
  print: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  // cubic-bezier(0.5, 0, 0.1, 1) — быстрый вылет
  slide: [0.5, 0, 0.1, 1] as [number, number, number, number],
  // cubic-bezier(0.7, 0, 0.3, 1) — сжатый burn
  burn: [0.7, 0, 0.3, 1] as [number, number, number, number],
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  // shadow-paper: subtle bottom line
  paper: {
    shadowColor: "#1A1208",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 1,
  },
  // shadow-cut: hard 2px offset (konstruktivist stamp)
  cut: {
    shadowColor: "#1A1208",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  cutGold: {
    shadowColor: "#D4A847",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
} as const;

// ─── Layout constants ─────────────────────────────────────────────────────────

export const layout = {
  // Max content width — center on tablets
  maxContentWidth: 480,
  // Standard page horizontal padding
  pagePadding: 20,
  // Header height
  headerHeight: 56,
} as const;

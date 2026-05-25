import { StyleSheet, Text, View } from "react-native";
import { GirihOverlay, PaperGrain } from "@shared/ui";
import { useT } from "@shared/lib";
import { fonts } from "@theme/tokens";

// SongCard always shows dark ink-on-cream, independent of app theme (same as web)
const CARD_INK = "#1A1208";
const CARD_PAPER = "#F5EFE0";
const CARD_REDACT = "#0E0804";
const CARD_GOLD = "#D4A847";
const PAPER_EDGE = "rgba(26,18,8,0.18)";

type SongCardProps = {
  title: string;
  artist: string;
  cardIdx?: number;
  totalCards?: number;
};

export function SongCard({ title, artist, cardIdx, totalCards }: SongCardProps) {
  const t = useT();
  const caseNo =
    cardIdx != null && totalCards != null
      ? t("song.case", {
          n: `${String(cardIdx + 1).padStart(2, "0")}/${String(totalCards).padStart(2, "0")}`,
        })
      : t("song.caseEmpty");

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <GirihOverlay size={140} opacity={0.06} />
        <PaperGrain opacity={0.32} />

        {/* Inner dashed border (mirrors web ::before inset 6px) */}
        <View style={styles.innerDashed} pointerEvents="none" />

        <View style={styles.header}>
          <Text style={styles.dossier}>{t("song.dossier")}</Text>
          <Text style={styles.caseNo}>{caseNo}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>

        <View style={styles.redactBar}>
          <Text style={styles.redactLabel}>{t("song.classified")}</Text>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.redactBlock} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  card: {
    position: "relative",
    overflow: "hidden",
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: CARD_PAPER,
    borderLeftWidth: 4,
    borderLeftColor: CARD_INK,
    borderRightWidth: 1,
    borderRightColor: PAPER_EDGE,
    borderTopWidth: 1,
    borderTopColor: PAPER_EDGE,
    borderBottomWidth: 1,
    borderBottomColor: PAPER_EDGE,
    // Hard 2px constructivist offset shadow
    shadowColor: CARD_INK,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4,
  },
  innerDashed: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: PAPER_EDGE,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 8,
  },
  dossier: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    color: CARD_INK,
    opacity: 0.7,
    includeFontPadding: false,
  },
  caseNo: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: "uppercase",
    color: CARD_INK,
    opacity: 0.75,
    includeFontPadding: false,
  },
  title: {
    fontFamily: fonts.condensedExtraBold,
    fontWeight: "800",
    fontSize: 26,
    lineHeight: 26,
    letterSpacing: 26 * -0.005,
    textTransform: "uppercase",
    color: CARD_INK,
    marginTop: 4,
    marginBottom: 2,
    includeFontPadding: false,
  },
  artist: {
    fontFamily: fonts.bodyItalic,
    fontStyle: "italic",
    fontSize: 13,
    color: CARD_INK,
    opacity: 0.78,
    includeFontPadding: false,
  },
  redactBar: {
    position: "relative",
    marginTop: 12,
    backgroundColor: CARD_REDACT,
    borderTopWidth: 1.5,
    borderTopColor: CARD_GOLD,
    borderBottomWidth: 1.5,
    borderBottomColor: CARD_GOLD,
    height: 55,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  redactBlock: {
    width: 22,
    height: 24,
    backgroundColor: CARD_GOLD,
  },
  redactLabel: {
    position: "absolute",
    top: 3,
    left: 6,
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 8 * 0.22,
    textTransform: "uppercase",
    color: CARD_GOLD,
    opacity: 0.7,
    includeFontPadding: false,
  },
});

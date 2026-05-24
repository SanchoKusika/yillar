import { StyleSheet, Text, View } from "react-native";
import { GirihOverlay, PaperGrain } from "@shared/ui";
import { useT } from "@shared/lib";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

// SongCard always shows dark ink-on-cream, independent of app theme (same as web)
const CARD_INK = "#1A1208";
const CARD_CREAM = "#F5EFE0";
const CARD_SURFACE2 = "#E8DFCA";
const CARD_REDACT = "#0E0804";
const CARD_GOLD = "#D4A847";

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
      <View style={[styles.card, { backgroundColor: CARD_CREAM }]}>
        <GirihOverlay size={140} opacity={0.06} />
        <PaperGrain opacity={0.32} />

        <View style={styles.header}>
          <Text style={[styles.dossier, { color: CARD_GOLD }]}>{t("song.dossier")}</Text>
          <Text style={[styles.caseNo, { color: CARD_GOLD }]}>{caseNo}</Text>
        </View>

        <Text style={[styles.title, { color: CARD_INK }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.artist, { color: CARD_INK }]} numberOfLines={1}>{artist}</Text>

        <View style={[styles.redactBar, { backgroundColor: CARD_REDACT, borderTopColor: CARD_GOLD }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.redactBlock, { borderRightColor: CARD_SURFACE2 }]} />
          ))}
          <Text style={[styles.redactLabel, { color: CARD_GOLD }]}>{t("song.classified")}</Text>
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
    overflow: "hidden",
    position: "relative",
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 0,
    ...{
      shadowColor: "#1A1208",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dossier: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  caseNo: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.12,
    includeFontPadding: false,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: "900",
    fontSize: 28,
    lineHeight: 28 * 1.0,
    letterSpacing: 28 * -0.02,
    marginBottom: 6,
    includeFontPadding: false,
  },
  artist: {
    fontFamily: fonts.condensedSemiBold,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 13 * 0.1,
    opacity: 0.65,
    marginBottom: 14,
    includeFontPadding: false,
  },
  redactBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 7,
    position: "relative",
  },
  redactBlock: {
    flex: 1,
    height: 10,
    borderRightWidth: 1,
  },
  redactLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 8 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});

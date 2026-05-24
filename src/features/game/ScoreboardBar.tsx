import { StyleSheet, Text, View } from "react-native";
import { useT } from "@shared/lib";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

type ScoreEntry = { id: string; name: string; score: number; turn: boolean };

type ScoreboardBarProps = {
  currentName: string;
  cardIdx: number;
  totalCards: number;
  entries: ScoreEntry[];
};

export function ScoreboardBar({ currentName, cardIdx, totalCards, entries }: ScoreboardBarProps) {
  const t = useT();
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.ink, borderBottomColor: colors.ink3 }]}>
      <View style={styles.headerTop}>
        <View style={styles.turnRow}>
          <Text style={[styles.turnLabel, { color: colors.cream3 }]}>{t("game.turn")}</Text>
          <Text style={[styles.turnName, { color: colors.cream }]}>{currentName}</Text>
        </View>
        <Text style={[styles.cardCount, { color: colors.gold }]}>
          {t("game.cardOf", {
            idx: String(cardIdx + 1).padStart(2, "0"),
            total: String(totalCards).padStart(2, "0"),
          })}
        </Text>
      </View>
      <View style={styles.cells}>
        {entries.map((p, i) => (
          <View
            key={p.id}
            style={[
              styles.scoreCell,
              { backgroundColor: p.turn ? colors.ink2 : colors.ink },
              i < entries.length - 1 && { borderRightWidth: 1, borderRightColor: colors.ink3 },
            ]}
          >
            {p.turn && <View style={[styles.activeLine, { backgroundColor: colors.gold }]} />}
            <Text style={[styles.scoreName, { color: p.turn ? colors.gold : colors.cream3 }]} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={[styles.scoreVal, { color: p.turn ? colors.gold : colors.cream }]}>
              {String(p.score).padStart(3, "0")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  turnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  turnLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  turnName: {
    fontFamily: fonts.condensedBold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 14 * 0.08,
    includeFontPadding: false,
  },
  cardCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.12,
    includeFontPadding: false,
  },
  cells: {
    flexDirection: "row",
  },
  scoreCell: {
    flex: 1,
    padding: 8,
    alignItems: "center",
    position: "relative",
    minHeight: 48,
    justifyContent: "center",
  },
  activeLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  scoreName: {
    fontFamily: fonts.condensed,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 9 * 0.12,
    includeFontPadding: false,
  },
  scoreVal: {
    fontFamily: fonts.monoBold,
    fontSize: 18,
    letterSpacing: 18 * -0.02,
    includeFontPadding: false,
  },
});

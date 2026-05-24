import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GirihOverlay, Multiplier, PaperGrain, YButton } from "@shared/ui";
import { ERA_LABEL, eraColor, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import type { Player } from "@entities/player";
import { ERA_COLORS, fonts } from "@theme/tokens";

type Stage = 0 | 1 | 2 | 3 | 4;

type Props = {
  last: Placement;
  nextPlayer: Player;
  onNext: () => void;
};

export function RevealStandard({ last, nextPlayer, onNext }: Props) {
  const t = useT();
  const era = last.era;
  const eraColors = ERA_COLORS[era];
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 900),
      setTimeout(() => setStage(3), 1350),
      setTimeout(() => setStage(4), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: eraColors.primary }]}>
      <PaperGrain opacity={0.4} />
      <GirihOverlay size={220} opacity={0.1} />

      <View style={styles.header}>
        <View style={[styles.eraBadge, { borderColor: eraColors.surface }]}>
          <Text style={[styles.eraBadgeText, { color: eraColors.surface }]}>
            {t(`era.${era}` as const)} · {ERA_LABEL[era]}
          </Text>
        </View>
        <Text style={[styles.trackTitle, { color: eraColors.surface }]}>{last.title}</Text>
        <Text style={[styles.trackSub, { color: eraColors.surface, opacity: 0.75 }]}>{last.artist}</Text>
      </View>

      <View style={styles.body}>
        {/* Year reveal with redact cover */}
        <View style={[styles.yearStage, { backgroundColor: eraColors.primary }]}>
          {stage >= 2 && (
            <Text style={[styles.yearText, { color: eraColors.surface }]}>{last.truth}</Text>
          )}
          {stage < 2 && (
            <View style={styles.redactCover}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.redactBlock, { backgroundColor: "#0E0804" }]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.multiplierRow}>
          <Text style={[styles.multiplierLabel, { color: eraColors.surface, opacity: 0.75 }]}>
            {t("reveal.eraMultiplier")}
          </Text>
          {stage >= 3 && <Multiplier n={last.multiplier} />}
        </View>

        <View style={[styles.statsGrid, { borderTopColor: eraColors.surface, borderBottomColor: eraColors.surface }]}>
          <StatCell label={t("reveal.youGuessed")} value={String(last.guess)} textColor={eraColors.surface} />
          <StatCell label={t("reveal.offBy")} value={`${last.delta} ${t("reveal.years")}`} textColor={eraColors.surface} align="center" />
          <View style={styles.statCellRight}>
            <Text style={[styles.statLabel, { color: eraColors.surface, opacity: 0.7 }]}>{t("reveal.points")}</Text>
            {stage >= 4 && (
              <Text style={[styles.pointsValue, { color: eraColors.surface }]}>+{last.points}</Text>
            )}
          </View>
        </View>

        {stage >= 4 && (
          <View style={[styles.mathBreakdown, { backgroundColor: eraColors.deep }]}>
            <Text style={[styles.mathText, { color: eraColors.surface }]}>
              {t("reveal.base", { n: last.base })}
            </Text>
            <Text style={[styles.mathText, { color: eraColors.surface }]}>
              {t("reveal.timesEra", { n: last.multiplier })}
            </Text>
            <Text style={[styles.mathText, { color: eraColors.surface }]}>
              {t("reveal.equalsPts", { n: last.points })}
            </Text>
          </View>
        )}
      </View>

      {stage >= 4 && (
        <View style={[styles.footer, { borderTopColor: eraColors.surface }]}>
          <YButton variant="era" era={era} onPress={onNext}>
            {t("reveal.nextCard", { name: nextPlayer.name })}
          </YButton>
        </View>
      )}
    </View>
  );
}

function StatCell({ label, value, textColor, align = "left" }: {
  label: string; value: string; textColor: string; align?: "left" | "center" | "right";
}) {
  return (
    <View style={[styles.statCell, { alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }]}>
      <Text style={[styles.statLabel, { color: textColor, opacity: 0.7 }]}>{label}</Text>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },
  header: {
    padding: 20,
    gap: 8,
  },
  eraBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  eraBadgeText: {
    fontFamily: fonts.condensedBold,
    fontSize: 10,
    letterSpacing: 10 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  trackTitle: {
    fontFamily: fonts.display,
    fontWeight: "900",
    fontSize: 32,
    lineHeight: 32 * 1.0,
    letterSpacing: 32 * -0.02,
    includeFontPadding: false,
  },
  trackSub: {
    fontFamily: fonts.condensedSemiBold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 13 * 0.1,
    includeFontPadding: false,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  yearStage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    minHeight: 100,
  },
  yearText: {
    fontFamily: fonts.monoBold,
    fontSize: 80,
    letterSpacing: 80 * -0.02,
    includeFontPadding: false,
  },
  redactCover: {
    flexDirection: "row",
    width: "100%",
    gap: 4,
  },
  redactBlock: {
    flex: 1,
    height: 60,
  },
  multiplierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  multiplierLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  statsGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  statCell: {
    flex: 1,
  },
  statCellRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 8 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    letterSpacing: 20 * -0.02,
    includeFontPadding: false,
  },
  pointsValue: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    letterSpacing: 28 * -0.02,
    includeFontPadding: false,
  },
  mathBreakdown: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  mathText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    includeFontPadding: false,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
  },
});

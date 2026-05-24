import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GirihOverlay, PaperGrain, YButton } from "@shared/ui";
import { ERA_LABEL, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import type { Player } from "@entities/player";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts } from "@theme/tokens";

type Props = {
  last: Placement;
  nextPlayer: Player;
  onNext: () => void;
};

export function RevealRejected({ last, nextPlayer, onNext }: Props) {
  const t = useT();
  const { colors } = useTheme();
  const eraColors = ERA_COLORS[last.era];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 220),
      setTimeout(() => setStage(2), 700),
      setTimeout(() => setStage(3), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.ink }]}>
      <PaperGrain opacity={0.35} />
      <GirihOverlay size={220} opacity={0.06} />

      <View style={styles.meta}>
        <View style={[styles.eraTag, { borderColor: eraColors.primary }]}>
          <Text style={[styles.eraTagText, { color: eraColors.primary }]}>
            {t(`era.${last.era}` as const)} · {ERA_LABEL[last.era]}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.cream }]}>{last.title}</Text>
        <Text style={[styles.subtitle, { color: colors.cream, opacity: 0.6 }]}>{last.artist}</Text>
      </View>

      <View style={styles.body}>
        {stage >= 1 && (
          <View style={[styles.stamp, { borderColor: colors.danger }]}>
            {/* Hatch pattern background */}
            <View style={[styles.hatchBg, { borderColor: colors.danger }]} />
            <Text style={[styles.stampText, { color: colors.danger }]}>
              {t("reveal.rejectedStamp")}
            </Text>
            <Text style={[styles.stampSub, { color: colors.danger, opacity: 0.7 }]}>
              {t("reveal.rejectedSub")}
            </Text>
          </View>
        )}

        {stage >= 2 && (
          <View style={styles.recordRow}>
            <Text style={[styles.recordLabel, { color: colors.cream3 }]}>
              {t("reveal.forRecord")}
            </Text>
            <Text style={[styles.recordYear, { color: eraColors.primary }]}>{last.truth}</Text>
          </View>
        )}

        {stage >= 3 && (
          <View style={styles.pointsRow}>
            <Text style={[styles.pointsLabel, { color: colors.cream3 }]}>
              {t("reveal.pointsAwarded")}
            </Text>
            <Text style={[styles.pointsValue, { color: colors.cream3 }]}>+0</Text>
          </View>
        )}
      </View>

      {stage >= 3 && (
        <View style={[styles.footer, { borderTopColor: colors.ink3 }]}>
          <YButton onPress={onNext}>{t("reveal.nextCard", { name: nextPlayer.name })}</YButton>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },
  meta: {
    padding: 20,
    gap: 8,
  },
  eraTag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  eraTagText: {
    fontFamily: fonts.condensedBold,
    fontSize: 10,
    letterSpacing: 10 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: "900",
    fontSize: 28,
    lineHeight: 28 * 1.0,
    letterSpacing: 28 * -0.02,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: fonts.condensedSemiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 12 * 0.1,
    includeFontPadding: false,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 24,
    paddingTop: 20,
  },
  stamp: {
    borderWidth: 2,
    padding: 20,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  hatchBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.06,
    borderWidth: 0,
  },
  stampText: {
    fontFamily: fonts.condensedExtraBold,
    fontSize: 32,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 32 * 0.1,
    includeFontPadding: false,
  },
  stampSub: {
    fontFamily: fonts.condensed,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 11 * 0.14,
    marginTop: 4,
    includeFontPadding: false,
  },
  recordRow: {
    alignItems: "center",
    gap: 4,
  },
  recordLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  recordYear: {
    fontFamily: fonts.monoBold,
    fontSize: 56,
    letterSpacing: 56 * -0.02,
    includeFontPadding: false,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  pointsValue: {
    fontFamily: fonts.monoBold,
    fontSize: 24,
    letterSpacing: 24 * -0.02,
    includeFontPadding: false,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
  },
});

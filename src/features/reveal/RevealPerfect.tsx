import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { G, Polygon } from "react-native-svg";
import { GirihOverlay, PaperGrain } from "@shared/ui";
import { ERA_LABEL, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import type { Player } from "@entities/player";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts } from "@theme/tokens";

const STAR_POINTS = "0,-30 6,-13 23,-17 12,-4 30,0 12,4 23,17 6,13 0,30 -6,13 -23,17 -12,4 -30,0 -12,-4 -23,-17 -6,-13";

function StarShape({ size = 64, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <G transform="translate(32 32)">
        <Polygon fill={color} points={STAR_POINTS} />
      </G>
    </Svg>
  );
}

type Props = {
  last: Placement;
  nextPlayer: Player;
  onNext: () => void;
};

export function RevealPerfect({ last, nextPlayer, onNext }: Props) {
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

  const eraMatch = last.multiplier > 1;
  const baseTimes = eraMatch
    ? `${t("reveal.base", { n: last.base })} ${t("reveal.timesEra", { n: last.multiplier })}`
    : t("reveal.base", { n: last.base });

  return (
    <View style={[styles.root, { backgroundColor: colors.ink }]}>
      <PaperGrain opacity={0.4} />
      <GirihOverlay size={240} opacity={0.12} />

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
        <View style={styles.yearStage}>
          <StarShape size={80} color={eraColors.primary} />
          {stage >= 1 && (
            <Text style={[styles.year, { color: eraColors.primary }]}>{last.truth}</Text>
          )}
        </View>

        {stage >= 2 && (
          <View style={styles.stampRow}>
            <StarShape size={24} color={eraColors.primary} />
            <Text style={[styles.stampText, { color: eraColors.primary }]}>
              {t("reveal.exactStamp")}
            </Text>
            <Text style={[styles.offBy, { color: colors.cream3 }]}>{t("reveal.offByZero")}</Text>
          </View>
        )}

        {stage >= 3 && (
          <View style={styles.math}>
            <Text style={[styles.mathBase, { color: colors.cream }]}>
              {baseTimes}{" "}
              <Text style={[styles.bonusToken, { color: eraColors.primary }]}>
                {t("reveal.bonusExact", { n: last.bonus })}
              </Text>
            </Text>
            <Text style={[styles.points, { color: eraColors.primary }]}>+{last.points}</Text>
          </View>
        )}
      </View>

      {stage >= 3 && (
        <View style={styles.footer}>
          <Pressable onPress={onNext} style={[styles.nextBtn, { borderColor: eraColors.primary }]}>
            <Text style={[styles.nextBtnText, { color: eraColors.primary }]}>
              {t("reveal.nextCard", { name: nextPlayer.name })}
            </Text>
          </Pressable>
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
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20,
    justifyContent: "center",
  },
  yearStage: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  year: {
    fontFamily: fonts.monoBold,
    fontSize: 80,
    letterSpacing: 80 * -0.02,
    includeFontPadding: false,
  },
  stampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stampText: {
    fontFamily: fonts.condensedBold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 14 * 0.12,
    includeFontPadding: false,
  },
  offBy: {
    fontFamily: fonts.mono,
    fontSize: 11,
    includeFontPadding: false,
  },
  math: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  mathBase: {
    fontFamily: fonts.mono,
    fontSize: 13,
    includeFontPadding: false,
  },
  bonusToken: {
    fontFamily: fonts.monoBold,
    fontWeight: "700",
  },
  points: {
    fontFamily: fonts.monoBold,
    fontSize: 32,
    letterSpacing: 32 * -0.02,
    includeFontPadding: false,
  },
  footer: {
    padding: 20,
  },
  nextBtn: {
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  nextBtnText: {
    fontFamily: fonts.condensedBold,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 13 * 0.14,
    includeFontPadding: false,
  },
});

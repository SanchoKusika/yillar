import { useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { CatalogLine } from "@shared/ui";
import { eraColor, haptic, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts } from "@theme/tokens";

const MIN_YEAR = 1960;
const MAX_YEAR = 2025;
const DECADE_SCALE = [1960, 1970, 1980, 1990, 2000, 2010, 2020, 2025];

type TimelineProps = {
  playerName: string;
  placements: Placement[];
  guessYear: number;
  onGuessChange: (y: number) => void;
};

export function Timeline({ playerName, placements, guessYear, onGuessChange }: TimelineProps) {
  const t = useT();
  const { colors } = useTheme();
  const prevDecadeRef = useRef(Math.floor(guessYear / 10));

  const handleChange = (value: number) => {
    const next = Math.round(value);
    const nextDecade = Math.floor(next / 10);
    if (nextDecade !== prevDecadeRef.current) {
      haptic("light");
      prevDecadeRef.current = nextDecade;
    }
    onGuessChange(next);
  };

  return (
    <View style={styles.root}>
      <CatalogLine
        left={t("timeline.title", { name: playerName })}
        right={t("timeline.placed", { n: placements.length })}
        style={styles.catalogLine}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.placementsScroll}>
        {placements.map((p, i) => {
          const eraColors = ERA_COLORS[p.era];
          return (
            <View
              key={i}
              style={[
                styles.placementCard,
                {
                  backgroundColor: eraColors.surface,
                  borderLeftColor: p.correct ? eraColors.primary : colors.danger,
                },
              ]}
            >
              <Text style={[styles.placementEra, { color: eraColors.primary }]}>
                {t(`era.short.${p.era}` as const)}
              </Text>
              <Text style={[styles.placementYear, { color: eraColors.primary }]}>{p.truth}</Text>
              <Text
                style={[styles.placementTitle, { color: eraColors.primary, borderTopColor: eraColors.primary }]}
                numberOfLines={1}
              >
                {p.title}
              </Text>
              {!p.correct && (
                <Text style={[styles.placementDelta, { color: colors.danger }]}>−{p.delta}Y</Text>
              )}
            </View>
          );
        })}

        {/* Drop zone for current guess */}
        <View style={[styles.placementCard, styles.dropZone, { borderColor: colors.gold }]}>
          <Text style={[styles.dropHint, { color: colors.cream3 }]}>
            {t("timeline.drop")}{"\n"}{t("timeline.here")}
          </Text>
          <Text style={[styles.dropYear, { color: colors.gold }]}>{guessYear}</Text>
          <Text style={[styles.dropIdx, { color: colors.cream3 }]}>
            {String(placements.length + 1).padStart(2, "0")}
          </Text>
        </View>
      </ScrollView>

      <Slider
        style={styles.slider}
        minimumValue={MIN_YEAR}
        maximumValue={MAX_YEAR}
        value={guessYear}
        step={1}
        onValueChange={handleChange}
        minimumTrackTintColor={colors.gold}
        maximumTrackTintColor={colors.ink3}
        thumbTintColor={colors.gold}
      />

      <View style={styles.ruler}>
        <View style={[styles.rulerLine, { backgroundColor: colors.ink3 }]} />
        {DECADE_SCALE.map((y) => {
          const pct = (y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
          return (
            <View key={y} style={[styles.decadeLabel, { left: `${pct * 100}%` as `${number}%` }]}>
              <View style={[styles.decadeTick, { backgroundColor: colors.ink3 }]} />
              <Text style={[styles.decadeText, { color: colors.cream3 }]}>{String(y).slice(2)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  catalogLine: {
    marginBottom: 10,
  },
  placementsScroll: {
    marginBottom: 4,
  },
  placementCard: {
    width: 72,
    marginRight: 6,
    padding: 6,
    borderLeftWidth: 3,
    position: "relative",
  },
  placementEra: {
    fontFamily: fonts.condensedBold,
    fontSize: 8,
    letterSpacing: 8 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  placementYear: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    letterSpacing: 16 * -0.02,
    includeFontPadding: false,
  },
  placementTitle: {
    fontFamily: fonts.condensed,
    fontSize: 8,
    borderTopWidth: 1,
    paddingTop: 3,
    marginTop: 3,
    includeFontPadding: false,
  },
  placementDelta: {
    position: "absolute",
    top: 4,
    right: 4,
    fontFamily: fonts.mono,
    fontSize: 8,
    includeFontPadding: false,
  },
  dropZone: {
    borderWidth: 1,
    borderLeftWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70,
  },
  dropHint: {
    fontFamily: fonts.mono,
    fontSize: 7,
    letterSpacing: 7 * 0.12,
    textTransform: "uppercase",
    textAlign: "center",
    includeFontPadding: false,
  },
  dropYear: {
    fontFamily: fonts.monoBold,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 18 * -0.02,
    includeFontPadding: false,
  },
  dropIdx: {
    fontFamily: fonts.mono,
    fontSize: 8,
    includeFontPadding: false,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  ruler: {
    height: 24,
    position: "relative",
  },
  rulerLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  decadeLabel: {
    position: "absolute",
    top: 0,
    alignItems: "center",
    transform: [{ translateX: -10 }],
  },
  decadeTick: {
    width: 1,
    height: 6,
  },
  decadeText: {
    fontFamily: fonts.mono,
    fontSize: 8,
    includeFontPadding: false,
  },
});

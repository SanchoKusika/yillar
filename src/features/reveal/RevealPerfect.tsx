import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { G, Polygon } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { GirihOverlay, PaperGrain } from "@shared/ui";
import { ERA_LABEL, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import type { Player } from "@entities/player";
import { fonts } from "@theme/tokens";

const INK = "#1A1208";
const GOLD = "#D4A847";
const CREAM = "#F5EFE0";

const STAR_POINTS =
  "0,-30 6,-13 23,-17 12,-4 30,0 12,4 23,17 6,13 0,30 -6,13 -23,17 -12,4 -30,0 -12,-4 -23,-17 -6,-13";

function StarShape({ size, color, opacity = 1 }: { size: number; color: string; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" opacity={opacity}>
      <G transform="translate(32 32)">
        <Polygon fill={color} points={STAR_POINTS} />
      </G>
    </Svg>
  );
}

function SpinningStar({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }, style]}>
      <StarShape size={size} color={color} opacity={opacity} />
    </Animated.View>
  );
}

function PulsingRing({ delayMs }: { delayMs: number }) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(
      delayMs,
      withRepeat(withTiming(3.6, { duration: 2100, easing: Easing.out(Easing.ease) }), -1, false),
    );
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 0 }),
          withTiming(0.18, { duration: 1500 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: "45deg" }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 60,
          height: 60,
          borderWidth: 1.5,
          borderColor: INK,
        },
        style,
      ]}
    />
  );
}

type Props = {
  last: Placement;
  nextPlayer: Player;
  onNext: () => void;
};

export function RevealPerfect({ last, nextPlayer, onNext }: Props) {
  const t = useT();

  // Staged animation
  const yearOp = useSharedValue(0);
  const yearScale = useSharedValue(1.4);
  const stampOp = useSharedValue(0);
  const stampY = useSharedValue(8);
  const mathOp = useSharedValue(0);
  const mathY = useSharedValue(8);
  const footerOp = useSharedValue(0);
  const footerY = useSharedValue(8);

  useEffect(() => {
    // stage 1 — year @ 220ms
    yearOp.value = withDelay(220, withTiming(1, { duration: 220 }));
    yearScale.value = withDelay(
      220,
      withTiming(1, { duration: 320, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }),
    );
    // stage 2 — stamp @ 700ms
    stampOp.value = withDelay(700, withTiming(1, { duration: 220 }));
    stampY.value = withDelay(700, withTiming(0, { duration: 240, easing: Easing.out(Easing.ease) }));
    // stage 3 — math + footer @ 1100ms
    mathOp.value = withDelay(1100, withTiming(1, { duration: 200 }));
    mathY.value = withDelay(1100, withTiming(0, { duration: 220, easing: Easing.out(Easing.ease) }));
    footerOp.value = withDelay(1100, withTiming(1, { duration: 200 }));
    footerY.value = withDelay(
      1100,
      withTiming(0, { duration: 220, easing: Easing.bezier(0.2, 0.8, 0.2, 1) }),
    );
  }, [yearOp, yearScale, stampOp, stampY, mathOp, mathY, footerOp, footerY]);

  const yearStyle = useAnimatedStyle(() => ({
    opacity: yearOp.value,
    transform: [{ scale: yearScale.value }],
  }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: stampOp.value,
    transform: [{ translateY: stampY.value }],
  }));
  const mathStyle = useAnimatedStyle(() => ({
    opacity: mathOp.value,
    transform: [{ translateY: mathY.value }],
  }));
  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOp.value,
    transform: [{ translateY: footerY.value }],
  }));

  const eraMatch = last.multiplier > 1;
  const baseTimes = eraMatch
    ? `${t("reveal.base", { n: last.base })} ${t("reveal.timesEra", { n: last.multiplier })}`
    : t("reveal.base", { n: last.base });

  return (
    <View style={[styles.root, { backgroundColor: GOLD }]}>
      <PaperGrain opacity={0.4} />
      <GirihOverlay size={240} opacity={0.12} />

      <View style={styles.meta}>
        <View style={[styles.eraTag, { borderColor: INK }]}>
          <Text style={[styles.eraTagText, { color: INK }]}>
            {t(`era.${last.era}` as const)} · {ERA_LABEL[last.era]}
          </Text>
        </View>
        <Text style={[styles.title, { color: INK }]} numberOfLines={2}>
          {last.title}
        </Text>
        <Text style={[styles.subtitle, { color: INK, opacity: 0.85 }]}>{last.artist}</Text>
      </View>

      <View style={styles.body}>
        <View style={[styles.yearStage, { borderTopColor: INK, borderBottomColor: INK }]}>
          <SpinningStar size={240} color={INK} opacity={0.12} />
          <PulsingRing delayMs={0} />
          <PulsingRing delayMs={700} />
          <PulsingRing delayMs={1400} />
          <Animated.Text style={[styles.year, { color: INK }, yearStyle]}>
            {last.truth}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.stampRow, stampStyle]}>
          <StarShape size={22} color={INK} />
          <Text style={[styles.stampText, { color: INK }]}>{t("reveal.exactStamp")}</Text>
          <Text style={[styles.offBy, { color: INK, opacity: 0.7 }]}>
            {t("reveal.offByZero")}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.math, { backgroundColor: INK }, mathStyle]}>
          <Text style={[styles.mathBase, { color: GOLD }]}>
            {baseTimes}{" "}
            <Text style={[styles.bonusToken, { color: CREAM }]}>
              {t("reveal.bonusExact", { n: last.bonus })}
            </Text>
          </Text>
          <Text style={[styles.points, { color: GOLD }]}>+{last.points}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { borderTopColor: INK }, footerStyle]}>
        <Pressable onPress={onNext} style={[styles.nextBtn, { backgroundColor: INK }]}>
          <Text style={[styles.nextBtnText, { color: GOLD }]}>
            {t("reveal.nextCard", { name: nextPlayer.name })}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  meta: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 6,
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
    fontWeight: "700",
    letterSpacing: 10 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  title: {
    marginTop: 10,
    fontFamily: fonts.condensedExtraBold,
    fontWeight: "800",
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: 32 * -0.005,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: fonts.bodyItalic,
    fontStyle: "italic",
    fontSize: 13,
    includeFontPadding: false,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 14,
    justifyContent: "center",
  },
  yearStage: {
    height: 160,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  year: {
    fontFamily: fonts.monoBold,
    fontWeight: "700",
    fontSize: 96,
    lineHeight: 96,
    letterSpacing: 96 * -0.03,
    includeFontPadding: false,
  },
  stampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stampText: {
    fontFamily: fonts.display,
    fontWeight: "900",
    fontSize: 32,
    letterSpacing: 32 * -0.02,
    includeFontPadding: false,
  },
  offBy: {
    marginLeft: "auto",
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  math: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  mathBase: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.1,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  bonusToken: {
    fontFamily: fonts.monoBold,
    fontWeight: "700",
  },
  points: {
    fontFamily: fonts.monoBold,
    fontWeight: "700",
    fontSize: 24,
    letterSpacing: 24 * -0.02,
    includeFontPadding: false,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
  },
  nextBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  nextBtnText: {
    fontFamily: fonts.condensedBold,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 13 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});

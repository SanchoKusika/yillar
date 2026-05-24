import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useT } from "@shared/lib";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";
import Svg, { Rect, Polygon } from "react-native-svg";

const BAR_COUNT = 10;
const BAR_DURATIONS = [620, 940, 480, 1120, 780, 560, 1020, 700, 860, 520];
const BAR_DELAYS = [220, 410, 70, 650, 180, 830, 310, 550, 120, 740];

type AudioStripProps = {
  playing: boolean;
  progress?: number;
  timeLabel?: string;
  onToggle: () => void;
};

function WaveBar({ index, playing, color }: { index: number; playing: boolean; color: string }) {
  const scale = useSharedValue(0.3);

  useEffect(() => {
    if (playing) {
      scale.value = withDelay(
        BAR_DELAYS[index] % BAR_DURATIONS[index],
        withRepeat(
          withTiming(1, { duration: BAR_DURATIONS[index], easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        ),
      );
    } else {
      scale.value = withTiming(0.3, { duration: 200 });
    }
  }, [playing, index, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  const height = 4 + (index % 4) * 4; // 4, 8, 12, 16px heights
  return (
    <Animated.View
      style={[
        { width: 3, backgroundColor: color, borderRadius: 1, height },
        animStyle,
      ]}
    />
  );
}

export function AudioStrip({
  playing,
  progress = 0.34,
  timeLabel = "00:58 / 02:58",
  onToggle,
}: AudioStripProps) {
  const t = useT();
  const { colors } = useTheme();

  return (
    <View style={[styles.strip, { borderTopColor: colors.ink3, borderBottomColor: colors.ink3 }]}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <View style={[styles.led, { backgroundColor: playing ? colors.danger : colors.ink3 }]} />
          <Text style={[styles.label, { color: colors.cream3 }]}>{t("audio.muted")}</Text>
        </View>
        <Text style={[styles.timeLabel, { color: colors.cream3 }]}>{timeLabel}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onToggle} style={[styles.playBtn, { borderColor: colors.gold }]}>
          {playing ? (
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Rect x="2" y="1" width="3.5" height="12" fill={colors.gold} />
              <Rect x="8.5" y="1" width="3.5" height="12" fill={colors.gold} />
            </Svg>
          ) : (
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Polygon points="2,1 12,7 2,13" fill={colors.gold} />
            </Svg>
          )}
        </Pressable>

        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: colors.ink3 }]} />
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` as `${number}%`, backgroundColor: colors.gold },
            ]}
          />
          {[0.25, 0.5, 0.75].map((frac) => (
            <View
              key={frac}
              style={[
                styles.progressTick,
                { left: `${frac * 100}%` as `${number}%`, backgroundColor: colors.ink },
              ]}
            />
          ))}
          <View
            style={[
              styles.progressThumb,
              {
                left: `${progress * 100}%` as `${number}%`,
                backgroundColor: colors.gold,
                transform: [{ translateX: -4 }],
              },
            ]}
          />
        </View>

        <View style={styles.waveStack}>
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <WaveBar key={i} index={i} playing={playing} color={colors.gold} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    marginHorizontal: 14,
    marginVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  led: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  timeLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    includeFontPadding: false,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  progressWrap: {
    flex: 1,
    height: 16,
    justifyContent: "center",
    position: "relative",
  },
  progressTrack: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
  },
  progressFill: {
    position: "absolute",
    top: "50%",
    left: 0,
    height: 2,
    marginTop: -1,
  },
  progressTick: {
    position: "absolute",
    top: 0,
    width: 1,
    height: "100%",
    opacity: 0.6,
  },
  progressThumb: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: "50%",
    marginTop: -4,
  },
  waveStack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 20,
    flexShrink: 0,
  },
});

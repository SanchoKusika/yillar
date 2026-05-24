import { StyleSheet, Text, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { GirihOverlay, PhoneFrame, Wordmark } from "@shared/ui";
import { useT, haptic } from "@shared/lib";
import { BottomNav } from "@features/navigation/BottomNav";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

export default function HomePage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();

  const onPassPlay = () => {
    haptic("light");
    router.push("/lobby");
  };

  const onOnline = () => {
    haptic("light");
    router.push("/online");
  };

  return (
    <PhoneFrame>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <GirihOverlay size={220} opacity={0.04} />

        <View style={styles.header}>
          <Wordmark color={colors.gold} size={48} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.gold, opacity: 0.5 }]} />

        <View style={styles.modes}>
          {/* PASS & PLAY */}
          <Pressable
            onPress={onPassPlay}
            style={({ pressed }) => [
              styles.modeBlock,
              pressed && { backgroundColor: `${colors.gold}14` },
            ]}
          >
            <GirihOverlay size={160} opacity={0.045} />
            <Text style={[styles.modeLabel, { color: colors.gold }]}>
              {t("home.mode.passPlayLabel")}
            </Text>
            <Text style={[styles.modeName, { color: colors.cream }]}>
              {t("home.mode.passPlay")}
            </Text>
            <Text style={[styles.modeSub, { color: colors.cream }]}>
              {t("home.mode.passPlaySub")}
            </Text>
            <Text style={[styles.modeArrow, { color: colors.gold }]}>→</Text>
          </Pressable>

          <View style={[styles.modeDivider, { backgroundColor: colors.gold, opacity: 0.4 }]} />

          {/* ONLINE */}
          <Pressable
            onPress={onOnline}
            style={({ pressed }) => [
              styles.modeBlock,
              pressed && { backgroundColor: `${colors.gold}14` },
            ]}
          >
            <GirihOverlay size={160} opacity={0.03} />
            <Text style={[styles.modeLabel, { color: colors.gold }]}>
              {t("home.mode.onlineLabel")}
            </Text>
            <Text style={[styles.modeName, { color: colors.gold }]}>
              {t("home.mode.online")}
            </Text>
            <Text style={[styles.modeSub, { color: colors.cream }]}>
              {t("home.mode.onlineSub")}
            </Text>
            <Text style={[styles.modeArrow, { color: colors.gold }]}>→</Text>
          </Pressable>
        </View>

        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: "center",
  },
  divider: {
    height: 1,
  },
  modes: {
    flex: 1,
  },
  modeBlock: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    overflow: "hidden",
    position: "relative",
  },
  modeLabel: {
    fontFamily: fonts.condensedBold,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 10 * 0.22,
    opacity: 0.85,
    marginBottom: 10,
    includeFontPadding: false,
  },
  modeName: {
    fontFamily: fonts.display,
    fontWeight: "900",
    fontSize: 52,
    lineHeight: 52 * 0.92,
    letterSpacing: 52 * -0.02,
    marginBottom: 14,
    includeFontPadding: false,
  },
  modeSub: {
    fontFamily: fonts.condensedSemiBold,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 12 * 0.12,
    opacity: 0.45,
    includeFontPadding: false,
  },
  modeArrow: {
    position: "absolute",
    bottom: 20,
    right: 22,
    fontFamily: fonts.mono,
    fontSize: 20,
    opacity: 0.5,
    includeFontPadding: false,
  },
  modeDivider: {
    height: 1,
  },
});

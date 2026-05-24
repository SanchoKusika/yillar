import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { GirihOverlay, PhoneFrame, Wordmark, YButton, Banner } from "@shared/ui";
import { env } from "@shared/config/env";
import { useT, haptic } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { createRoom, joinRoom } from "@entities/room";
import { BottomNav } from "@features/navigation/BottomNav";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

export default function OnlinePage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialName = profile?.displayName ?? "";

  const onCreate = async () => {
    if (!user || busy) return;
    setError(null);
    setBusy("create");
    haptic("medium");
    try {
      const room = await createRoom(user.id, initialName);
      router.push(`/online/room/${room.code}`);
    } catch {
      setError(t("online.roomNotFound"));
      setBusy(null);
    }
  };

  const onJoin = async () => {
    if (!user || busy || code.length < 4) return;
    setError(null);
    setBusy("join");
    haptic("medium");
    try {
      const room = await joinRoom(code, user.id, initialName);
      router.push(`/online/room/${room.code}`);
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "room-full"
          ? t("online.roomFull")
          : t("online.roomNotFound");
      setError(msg);
      setBusy(null);
    }
  };

  const noSupabase = !env.hasSupabase;

  return (
    <PhoneFrame>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <GirihOverlay size={220} opacity={0.04} />

        <View style={[styles.pageHeader, { borderBottomColor: colors.gold }]}>
          <Pressable onPress={() => router.replace("/")} style={styles.leaveBtn}>
            <Text style={[styles.leaveBtnText, { color: colors.cream3 }]}>{t("online.waitBack")}</Text>
          </Pressable>
          <Wordmark size={44} />
        </View>

        {noSupabase ? (
          <View style={styles.demoCenter}>
            <Text style={[styles.demoBadge, { color: colors.gold }]}>● DEMO MODE</Text>
            <Text style={[styles.demoTitle, { color: colors.cream }]}>{t("online.soon")}</Text>
            <Text style={[styles.demoSub, { color: colors.cream3 }]}>{t("online.soonSub")}</Text>
          </View>
        ) : (
          <View style={styles.modesContainer}>
            {/* CREATE */}
            <Pressable
              style={({ pressed }) => [
                styles.createBlock,
                { backgroundColor: pressed ? colors.ink2 : colors.ink, borderBottomColor: colors.ink3 },
              ]}
              onPress={onCreate}
              disabled={busy !== null}
            >
              <GirihOverlay size={160} opacity={0.04} />
              <Text style={[styles.modeLabel, { color: colors.cream3 }]}>{t("online.createLabel")}</Text>
              <Text style={[styles.modeName, { color: colors.cream }]}>
                {busy === "create" ? t("online.creating") : t("online.create")}
              </Text>
              <Text style={[styles.modeArrow, { color: colors.gold }]}>→</Text>
            </Pressable>

            {/* JOIN */}
            <View style={[styles.joinBlock, { backgroundColor: colors.ink }]}>
              <GirihOverlay size={160} opacity={0.025} />
              <Text style={[styles.modeLabel, { color: colors.cream3 }]}>{t("online.joinLabel")}</Text>
              <RNTextInput
                style={[styles.codeInput, { color: colors.cream, borderColor: code.length > 0 ? colors.gold : colors.ink3 }]}
                value={code}
                onChangeText={(v) => {
                  setError(null);
                  setCode(v.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 4));
                }}
                placeholder="XXXX"
                placeholderTextColor={colors.cream3}
                maxLength={4}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {error && <Banner variant="error">{error}</Banner>}
              <YButton disabled={code.length < 4 || busy !== null} onPress={onJoin}>
                {busy === "join" ? t("online.joining") : t("online.joinBtn")}
              </YButton>
            </View>
          </View>
        )}

        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  leaveBtn: {
    alignSelf: "flex-start",
  },
  leaveBtnText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  demoCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  demoBadge: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  demoTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "900",
    includeFontPadding: false,
  },
  demoSub: {
    fontFamily: fonts.mono,
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 11 * 0.12,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  modesContainer: {
    flex: 1,
  },
  createBlock: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    overflow: "hidden",
  },
  joinBlock: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-end",
    gap: 10,
    overflow: "hidden",
  },
  modeLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    marginBottom: 4,
    includeFontPadding: false,
  },
  modeName: {
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: "900",
    includeFontPadding: false,
  },
  modeArrow: {
    fontFamily: fonts.mono,
    fontSize: 20,
    marginTop: 4,
    includeFontPadding: false,
  },
  codeInput: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    letterSpacing: 28 * 0.2,
    textTransform: "uppercase",
    borderWidth: 1,
    padding: 12,
    includeFontPadding: false,
  },
});

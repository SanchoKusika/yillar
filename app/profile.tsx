import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Banner, GirihOverlay, PhoneFrame, YButton, FieldLabel } from "@shared/ui";
import { useT } from "@shared/lib";
import { signOut, useSessionStore } from "@entities/session";
import { useProfileStats } from "@entities/game-history";
import { usePreferencesStore, type Theme } from "@entities/preferences";
import { BottomNav } from "@features/navigation/BottomNav";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts } from "@theme/tokens";
import FlagRU from "@shared/assets/svg/flags/ru.svg";
import FlagUZ from "@shared/assets/svg/flags/uz.svg";
import FlagEN from "@shared/assets/svg/flags/en.svg";
import type { Language } from "@entities/preferences/model/types";

const LANGS: { lng: Language; code: string; Flag: typeof FlagRU }[] = [
  { lng: "ru", code: "RU", Flag: FlagRU },
  { lng: "uz", code: "O'Z", Flag: FlagUZ },
  { lng: "en", code: "EN", Flag: FlagEN },
];

export default function ProfilePage() {
  const router = useRouter();
  const t = useT();
  const { colors, theme } = useTheme();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const loading = useSessionStore((s) => s.loading);
  const stats = useProfileStats(user?.id);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSignOutBusy(true);
    setSignOutError(null);
    try {
      await signOut();
      router.replace("/");
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "Error");
    } finally {
      setSignOutBusy(false);
    }
  };

  if (loading) {
    return (
      <PhoneFrame>
        <View style={[styles.center, { backgroundColor: colors.ink }]}>
          <Text style={[styles.hint, { color: colors.cream3 }]}>{t("profile.loadingPage")}</Text>
        </View>
      </PhoneFrame>
    );
  }

  if (!user) {
    return (
      <PhoneFrame>
        <View style={[styles.container, { backgroundColor: colors.ink }]}>
          <GirihOverlay size={200} opacity={0.05} />
          <View style={styles.signedOutContent}>
            <Text style={[styles.signedOutTitle, { color: colors.cream }]}>
              {t("profile.signedOut.title")}
            </Text>
            <Text style={[styles.signedOutBody, { color: colors.cream3 }]}>
              {t("profile.signedOut.body")}
            </Text>
            <YButton onPress={() => router.push("/auth")}>{t("profile.signedOut.cta")}</YButton>
          </View>
          <BottomNav />
        </View>
      </PhoneFrame>
    );
  }

  const isAnon = user.isAnonymous;
  const displayName =
    profile?.displayName?.toUpperCase() ||
    (isAnon ? t("profile.guestUpper") : user.email?.toUpperCase() || t("profile.member"));
  const initial = displayName.charAt(0) || "·";
  const era = profile?.generation ?? null;
  const eraColors = era ? ERA_COLORS[era] : null;

  return (
    <PhoneFrame>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <GirihOverlay size={220} opacity={0.05} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Avatar + name header */}
          <View style={[styles.header, { borderBottomColor: colors.ink3 }]}>
            <View style={[styles.avatar, { backgroundColor: eraColors?.primary ?? colors.ink3 }]}>
              <Text style={[styles.avatarInitial, { color: eraColors?.surface ?? colors.cream }]}>
                {initial}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.displayName, { color: colors.cream }]}>{displayName}</Text>
              {!isAnon && user.email && (
                <Text style={[styles.email, { color: colors.cream3 }]}>{user.email}</Text>
              )}
              {isAnon && (
                <Text style={[styles.email, { color: colors.cream3 }]}>{t("profile.statusGuest")}</Text>
              )}
            </View>
          </View>

          {/* Stats */}
          {!isAnon && stats.data && (
            <View style={[styles.section, { borderBottomColor: colors.ink3 }]}>
              <View style={styles.statsRow}>
                <StatBox label={t("profile.statPlayed")} value={String(stats.data.gamesPlayed ?? 0)} colors={colors} />
                <StatBox label={t("profile.statBest")} value={String(stats.data.bestScore ?? 0)} colors={colors} />
                <StatBox label={t("profile.statAvg")} value={String(Math.round(stats.data.averageScore ?? 0))} colors={colors} />
              </View>
            </View>
          )}

          {/* Theme */}
          <View style={[styles.section, { borderBottomColor: colors.ink3 }]}>
            <FieldLabel>{t("profile.settings.theme")}</FieldLabel>
            <View style={styles.optionsRow}>
              {(["dark", "light"] as Theme[]).map((th) => (
                <Pressable
                  key={th}
                  onPress={() => setTheme(th)}
                  style={[
                    styles.optionBtn,
                    { borderColor: theme === th ? colors.gold : colors.ink3 },
                    theme === th && { backgroundColor: colors.ink2 },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme === th ? colors.gold : colors.cream3 }]}>
                    {th === "dark" ? t("profile.settings.themeDark") : t("profile.settings.themeLight")}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Language */}
          <View style={[styles.section, { borderBottomColor: colors.ink3 }]}>
            <FieldLabel>{t("profile.settings.language")}</FieldLabel>
            <View style={styles.optionsRow}>
              {LANGS.map(({ lng, code, Flag }) => (
                <Pressable
                  key={lng}
                  onPress={() => setLanguage(lng)}
                  style={[
                    styles.optionBtn,
                    { borderColor: language === lng ? colors.gold : colors.ink3 },
                    language === lng && { backgroundColor: colors.ink2 },
                  ]}
                >
                  <Flag width={20} height={14} />
                  <Text style={[styles.optionText, { color: language === lng ? colors.gold : colors.cream3 }]}>
                    {code}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Auth actions */}
          <View style={styles.section}>
            {isAnon ? (
              <YButton onPress={() => router.push("/auth")}>{t("auth.tabSignUp")}</YButton>
            ) : (
              <>
                {signOutError && <Banner variant="error">{signOutError}</Banner>}
                <YButton variant="ghost" disabled={signOutBusy} onPress={handleSignOut}>
                  {t("profile.signOut")}
                </YButton>
              </>
            )}
          </View>
        </ScrollView>

        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

function StatBox({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  return (
    <View style={[styles.statBox, { borderColor: colors.ink3 }]}>
      <Text style={[styles.statValue, { color: colors.cream }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.cream3 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  signedOutContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  signedOutTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: "900",
    includeFontPadding: false,
  },
  signedOutBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: "center",
    includeFontPadding: false,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: "900",
    includeFontPadding: false,
  },
  headerInfo: { flex: 1, gap: 2 },
  displayName: {
    fontFamily: fonts.condensedBold,
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 20 * 0.04,
    includeFontPadding: false,
  },
  email: {
    fontFamily: fonts.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.condensedBold,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 11 * 0.18,
    marginBottom: 2,
    includeFontPadding: false,
  },
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    letterSpacing: 22 * -0.02,
    includeFontPadding: false,
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 8 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  optionsRow: { flexDirection: "row", gap: 6 },
  optionBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  optionText: {
    fontFamily: fonts.condensedBold,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 11 * 0.12,
    includeFontPadding: false,
  },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 11,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});

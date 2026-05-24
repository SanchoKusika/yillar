import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { GirihOverlay, PhoneFrame, Wordmark, YButton, Banner, FieldLabel, GoldRule, TextInput } from "@shared/ui";
import { env } from "@shared/config/env";
import { useT } from "@shared/lib";
import {
  signInAnonymously,
  signInWithEmail,
  signUpWithEmail,
  resetPasswordForEmail,
  useSessionStore,
} from "@entities/session";
import { BottomNav } from "@features/navigation/BottomNav";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

type Mode = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isAnon = useSessionStore((s) => s.user?.isAnonymous ?? false);

  const onSubmit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "forgot") {
        await resetPasswordForEmail(email.trim());
        setNotice(`${t("auth.resetSentPrefix")} ${email.trim().toUpperCase()} ${t("auth.resetSentSuffix")}`);
        setEmail("");
        return;
      }
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
        router.replace("/");
      } else {
        const wasAnon = isAnon;
        const outcome = await signUpWithEmail({
          email: email.trim(),
          password,
          displayName: displayName.trim() || undefined,
        });
        if (outcome.status === "confirmed") {
          setNotice(wasAnon ? t("auth.migrationNotice") : t("auth.successConfirmed"));
          setTimeout(() => router.replace("/"), 900);
        } else {
          setNotice(`${t("auth.emailSentPrefix")} ${outcome.email.toUpperCase()} ${t("auth.emailSentSuffix")}`);
          setEmail(""); setPassword(""); setDisplayName("");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const onGuest = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInAnonymously();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  if (!env.hasSupabase) {
    return (
      <PhoneFrame>
        <View style={[styles.container, { backgroundColor: colors.ink }]}>
          <View style={styles.demoContent}>
            <Wordmark size={48} />
            <Text style={[styles.demoNotice, { color: colors.cream3 }]}>{t("auth.demoNotice")}</Text>
          </View>
          <BottomNav />
        </View>
      </PhoneFrame>
    );
  }

  const submitLabel = busy
    ? "…"
    : mode === "signin"
    ? t("auth.btnSignIn")
    : mode === "signup"
    ? t("auth.btnSignUp")
    : t("auth.btnSendReset");

  const headerLabel =
    mode === "signin"
      ? t("auth.headerSignIn")
      : mode === "signup"
      ? t("auth.headerSignUp")
      : t("auth.resetHeader");

  return (
    <PhoneFrame>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <GirihOverlay size={200} opacity={0.05} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.wordmarkWrap}>
              <Wordmark size={44} />
              <Text style={[styles.subtitle, { color: colors.cream3 }]}>{headerLabel}</Text>
            </View>

            {mode !== "forgot" && (
              <View style={styles.tabs}>
                <Pressable
                  onPress={() => { setMode("signin"); setError(null); setNotice(null); }}
                  style={[styles.tab, mode === "signin" && { borderBottomColor: colors.gold }]}
                >
                  <Text style={[styles.tabText, { color: mode === "signin" ? colors.gold : colors.cream3 }]}>
                    {t("auth.tabSignIn")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => { setMode("signup"); setError(null); setNotice(null); }}
                  style={[styles.tab, mode === "signup" && { borderBottomColor: colors.gold }]}
                >
                  <Text style={[styles.tabText, { color: mode === "signup" ? colors.gold : colors.cream3 }]}>
                    {t("auth.tabSignUp")}
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.form}>
              {mode === "signup" && (
                <View style={styles.field}>
                  <FieldLabel>{t("auth.fieldName")}</FieldLabel>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="DILNOZA"
                    autoCapitalize="words"
                  />
                </View>
              )}

              {mode === "forgot" && (
                <Text style={[styles.hint, { color: colors.cream3 }]}>{t("auth.forgotHint")}</Text>
              )}

              <View style={styles.field}>
                <FieldLabel>{t("auth.fieldEmail")}</FieldLabel>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {mode !== "forgot" && (
                <View style={styles.field}>
                  <FieldLabel>{t("auth.fieldPassword")}</FieldLabel>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              )}

              {mode === "signin" && (
                <Pressable
                  onPress={() => { setMode("forgot"); setError(null); setNotice(null); }}
                >
                  <Text style={[styles.linkBtn, { color: colors.gold }]}>{t("auth.forgotPassword")}</Text>
                </Pressable>
              )}

              {mode === "forgot" && (
                <Pressable
                  onPress={() => { setMode("signin"); setError(null); setNotice(null); }}
                >
                  <Text style={[styles.linkBtn, { color: colors.cream3 }]}>{t("auth.backToSignIn")}</Text>
                </Pressable>
              )}

              {error && <Banner variant="error">{error}</Banner>}
              {notice && <Banner variant="gold">{notice}</Banner>}

              <YButton disabled={busy} onPress={onSubmit}>{submitLabel}</YButton>
            </View>

            {mode !== "forgot" && (
              <View style={styles.guestSection}>
                <GoldRule style={{ opacity: 0.3 }} />
                <YButton variant="ghost" onPress={onGuest} disabled={busy}>
                  {t("auth.btnGuest")}
                </YButton>
                <Text style={[styles.guestHint, { color: colors.cream3 }]}>{t("auth.guestHint")}</Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  demoContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  demoNotice: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.14,
    textTransform: "uppercase",
    textAlign: "center",
    includeFontPadding: false,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  wordmarkWrap: {
    alignItems: "center",
    gap: 8,
  },
  subtitle: {
    fontFamily: fonts.condensed,
    fontSize: 11,
    letterSpacing: 11 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontFamily: fonts.condensedBold,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 12 * 0.14,
    includeFontPadding: false,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 0,
  },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.12,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  linkBtn: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.14,
    textTransform: "uppercase",
    textDecorationLine: "underline",
    includeFontPadding: false,
  },
  guestSection: {
    gap: 12,
  },
  guestHint: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.14,
    textTransform: "uppercase",
    textAlign: "center",
    includeFontPadding: false,
  },
});

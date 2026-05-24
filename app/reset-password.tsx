import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PhoneFrame, Wordmark, YButton, Banner, FieldLabel } from "@shared/ui";
import { useT } from "@shared/lib";
import { updatePassword, useSessionStore } from "@entities/session";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";
import { TextInput } from "@shared/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ token?: string }>();
  const user = useSessionStore((s) => s.user);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase sends the session automatically when the deep link is followed.
  // No manual token handling needed — the session store will be populated.

  const onSubmit = async () => {
    if (busy) return;
    if (password !== confirm) {
      setError(t("auth.passwordMismatch") ?? "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => router.replace("/"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <View style={styles.content}>
          <Wordmark size={44} />
          <Text style={[styles.subtitle, { color: colors.cream3 }]}>
            {t("auth.resetHeader")}
          </Text>

          {done ? (
            <Banner variant="gold">{t("auth.passwordUpdated")}</Banner>
          ) : (
            <View style={styles.form}>
              <View>
                <FieldLabel>{t("auth.newPassword")}</FieldLabel>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View>
                <FieldLabel>{t("auth.confirmPassword")}</FieldLabel>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {error && <Banner variant="error">{error}</Banner>}

              <YButton disabled={busy || !password || !confirm} onPress={onSubmit}>
                {busy ? "…" : t("auth.btnSetPassword")}
              </YButton>
            </View>
          )}
        </View>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: fonts.condensed,
    fontSize: 11,
    letterSpacing: 11 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  form: {
    width: "100%",
    gap: 14,
  },
});

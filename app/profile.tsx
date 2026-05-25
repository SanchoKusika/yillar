import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Banner,
  CatalogLine,
  EraSelect,
  EraTag,
  FieldLabel,
  GirihOverlay,
  PhoneFrame,
  SectionHeader,
  TextInput,
  YButton,
} from "@shared/ui";
import { env } from "@shared/config/env";
import { ERA_LABEL, useT, type Era } from "@shared/lib";
import {
  signOut,
  updatePassword,
  updateProfile,
  uploadAvatar,
  useSessionStore,
  type AvatarFile,
} from "@entities/session";
import {
  useHistory,
  useProfileStats,
  type EraBreakdownEntry,
  type BestDecade,
} from "@entities/game-history";
import { usePreferencesStore, type Language, type Theme } from "@entities/preferences";
import { BottomNav } from "@features/navigation/BottomNav";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts } from "@theme/tokens";
import FlagRU from "@shared/assets/svg/flags/ru.svg";
import FlagUZ from "@shared/assets/svg/flags/uz.svg";
import FlagEN from "@shared/assets/svg/flags/en.svg";

type Tab = "stats" | "history" | "friends" | "settings";
const TAB_KEYS: Tab[] = ["stats", "history", "friends", "settings"];

const LANGS: { lng: Language; code: string; Flag: typeof FlagRU }[] = [
  { lng: "ru", code: "RU", Flag: FlagRU },
  { lng: "uz", code: "O'Z", Flag: FlagUZ },
  { lng: "en", code: "EN", Flag: FlagEN },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const setProfile = useSessionStore((s) => s.setProfile);
  const loading = useSessionStore((s) => s.loading);
  const stats = useProfileStats(user?.id);
  const history = useHistory(user?.id, 10);
  const [tab, setTab] = useState<Tab>("stats");

  if (loading) {
    return (
      <PhoneFrame>
        <View style={[styles.center, { backgroundColor: colors.ink }]}>
          <Text style={[styles.loading, { color: colors.cream, opacity: 0.6 }]}>
            {t("profile.loadingPage")}
          </Text>
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
            <Text style={[styles.signedOutBody, { color: colors.cream, opacity: 0.65 }]}>
              {t("profile.signedOut.body")}
            </Text>
            <YButton onPress={() => router.push("/auth")}>
              {t("profile.signedOut.cta")}
            </YButton>
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

  return (
    <PhoneFrame>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <GirihOverlay size={220} opacity={0.05} />

        <ProfileHeader
          displayName={displayName}
          initial={initial}
          era={era}
          avatarUrl={profile?.avatarUrl ?? null}
          email={user.email ?? null}
          isAnon={isAnon}
        />

        <TopStats
          bestScore={stats.data?.bestScore}
          averageScore={stats.data?.averageScore}
          gamesPlayed={stats.data?.gamesPlayed}
        />

        <View style={[styles.tabsRow, { borderBottomColor: colors.ink3 }]}>
          {TAB_KEYS.map((id) => (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              style={[
                styles.tabBtn,
                tab === id && {
                  backgroundColor: colors.ink2,
                  borderTopColor: colors.gold,
                  borderTopWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: tab === id ? colors.gold : colors.cream, opacity: tab === id ? 1 : 0.55 },
                ]}
              >
                {t(`profile.tabs.${id}` as const)}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
          {tab === "stats" && (
            <StatsTab
              eraBreakdown={stats.data?.eraBreakdown}
              bestDecade={stats.data?.bestDecade}
              wins={stats.data?.wins}
              loading={stats.isLoading}
            />
          )}
          {tab === "history" && (
            <HistoryTab entries={history.data} loading={history.isLoading} />
          )}
          {tab === "friends" && <FriendsTab />}
          {tab === "settings" && (
            <SettingsTab
              initialName={profile?.displayName ?? ""}
              initialEra={era}
              avatarUrl={profile?.avatarUrl ?? null}
              initial={initial}
              isAnon={isAnon}
              onAvatarUpload={async (file) => {
                if (!user || !profile) return;
                const url = await uploadAvatar(user.id, file);
                setProfile({ ...profile, avatarUrl: url });
              }}
              onSave={async (name, gen) => {
                await updateProfile({ displayName: name, generation: gen });
                if (profile) setProfile({ ...profile, displayName: name ?? null, generation: gen ?? null });
              }}
              onSignOut={async () => {
                try {
                  await signOut();
                } catch (err) {
                  console.warn("[YILLAR] sign out failed:", err);
                }
                router.replace("/auth");
              }}
              onCreateAccount={() => router.push("/auth")}
            />
          )}

          {!env.hasSupabase && (
            <View style={{ marginTop: 16 }}>
              <Banner variant="error">{t("profile.demoMode")}</Banner>
            </View>
          )}
        </ScrollView>

        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

// ─── ProfileHeader ───────────────────────────────────────────────────────────

function ProfileHeader({
  displayName,
  initial,
  era,
  avatarUrl,
  email,
  isAnon,
}: {
  displayName: string;
  initial: string;
  era: Era | null;
  avatarUrl: string | null;
  email: string | null;
  isAnon: boolean;
}) {
  const t = useT();
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.ink3 }]}>
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={[styles.avatarImg, { borderColor: colors.gold }]} />
        ) : (
          <View
            style={[
              styles.avatarLetter,
              {
                borderColor: colors.gold,
                backgroundColor: era ? ERA_COLORS[era].primary : colors.gold,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarLetterText,
                { color: era ? ERA_COLORS[era].surface : colors.ink },
              ]}
            >
              {initial}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.headerInfo}>
        <Text style={[styles.displayName, { color: colors.cream }]} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={{ marginTop: 6 }}>
          {era ? (
            <EraTag era={era} boxed />
          ) : (
            <Text style={[styles.noGeneration, { color: colors.gold, opacity: 0.6 }]}>
              {t("profile.noGeneration")}
            </Text>
          )}
        </View>
        <Text
          style={[styles.subtitle, { color: colors.cream, opacity: 0.5 }]}
          numberOfLines={1}
        >
          {isAnon ? t("profile.guestSubtitle") : email ?? t("profile.memberSubtitle")}
        </Text>
      </View>
    </View>
  );
}

// ─── TopStats ────────────────────────────────────────────────────────────────

function TopStats({
  bestScore,
  averageScore,
  gamesPlayed,
}: {
  bestScore: number | null | undefined;
  averageScore: number | null | undefined;
  gamesPlayed: number | null | undefined;
}) {
  const t = useT();
  const { colors } = useTheme();
  return (
    <View style={[styles.topStats, { borderBottomColor: colors.gold }]}>
      <StatCell label={t("profile.statBest")} value={bestScore} />
      <StatCell label={t("profile.statAvg")} value={averageScore} bordered />
      <StatCell label={t("profile.statPlayed")} value={gamesPlayed} bordered />
    </View>
  );
}

function StatCell({
  label,
  value,
  bordered,
}: {
  label: string;
  value: number | null | undefined;
  bordered?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.statCell,
        bordered && { borderLeftWidth: 1, borderLeftColor: colors.ink3 },
      ]}
    >
      <Text style={[styles.statLabel, { color: colors.gold }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.cream }]}>
        {value == null ? "—" : value}
      </Text>
    </View>
  );
}

// ─── Stats tab ───────────────────────────────────────────────────────────────

function StatsTab({
  eraBreakdown,
  bestDecade,
  wins,
  loading,
}: {
  eraBreakdown: EraBreakdownEntry[] | undefined;
  bestDecade: BestDecade | null | undefined;
  wins: number | undefined;
  loading: boolean;
}) {
  const t = useT();
  const { colors } = useTheme();
  if (loading) {
    return <Text style={[styles.loading, { color: colors.cream, opacity: 0.55 }]}>{t("profile.loading")}</Text>;
  }

  return (
    <View style={{ gap: 16 }}>
      <View>
        <CatalogLine left={t("profile.eraBreakdown")} right={t("profile.uniqueGuessed")} />
        <View style={{ marginTop: 10, gap: 12 }}>
          {(eraBreakdown ?? []).map((r) => {
            const pct = r.total > 0 ? (r.correct / r.total) * 100 : 0;
            const eraC = ERA_COLORS[r.era];
            return (
              <View key={r.era}>
                <View style={styles.eraRow}>
                  <Text style={[styles.eraRowName, { color: eraC.primary }]}>{ERA_LABEL[r.era]}</Text>
                  <Text style={[styles.eraRowMeta, { color: colors.cream, opacity: 0.7 }]}>
                    {r.correct} / {r.total} {t("profile.tracksWord")} · {Math.round(pct)}%
                  </Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: colors.ink3 }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pct}%` as `${number}%`, backgroundColor: eraC.primary },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.statCard, { borderColor: colors.ink3 }]}>
        <Text style={[styles.cardLabel, { color: colors.gold }]}>{t("profile.bestDecade")}</Text>
        {bestDecade ? (
          <>
            <Text style={[styles.cardBigNum, { color: colors.cream }]}>
              {t("profile.decadeFormat", { n: bestDecade.decade })}
            </Text>
            <Text style={[styles.cardSub, { color: colors.cream, opacity: 0.65 }]}>
              {bestDecade.correct}/{bestDecade.total} {t("profile.songsWord")} ·{" "}
              {Math.round(bestDecade.accuracy * 100)}%
            </Text>
          </>
        ) : (
          <Text style={[styles.cardEmpty, { color: colors.cream, opacity: 0.5 }]}>
            {t("profile.bestDecade.empty")}
          </Text>
        )}
      </View>

      <View style={[styles.statCard, { borderColor: colors.ink3 }]}>
        <Text style={[styles.cardLabel, { color: colors.gold }]}>{t("profile.wins")}</Text>
        <Text style={[styles.cardBigNum, { color: colors.cream }]}>{wins ?? "—"}</Text>
      </View>
    </View>
  );
}

// ─── History tab ─────────────────────────────────────────────────────────────

type HistoryEntry = {
  id: string;
  startedAt: string;
  totalCards: number;
  hostScore: number;
  hostRank: number | null;
  isWinner: boolean;
  playerCount: number;
};

function HistoryTab({
  entries,
  loading,
}: {
  entries: HistoryEntry[] | undefined;
  loading: boolean;
}) {
  const t = useT();
  const { colors } = useTheme();
  return (
    <View>
      <CatalogLine left={t("profile.lastSessions")} right={`${entries?.length ?? 0}`} />
      {loading ? (
        <Text style={[styles.loading, { color: colors.cream, opacity: 0.55, marginTop: 10 }]}>
          {t("profile.loading")}
        </Text>
      ) : entries && entries.length > 0 ? (
        <View style={{ marginTop: 10, gap: 6 }}>
          {entries.map((g) => (
            <View
              key={g.id}
              style={[
                styles.histRow,
                {
                  backgroundColor: colors.ink2,
                  borderLeftColor: g.isWinner ? colors.gold : colors.ink3,
                },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.histMeta, { color: colors.cream, opacity: 0.55 }]}>
                  {formatDate(g.startedAt)} · {g.playerCount} {t("profile.players")}
                </Text>
                <Text style={[styles.histRank, { color: colors.cream }]}>
                  {g.isWinner
                    ? t("profile.winnerStar")
                    : g.hostRank
                      ? `# ${t("profile.placeBadge", { n: g.hostRank })}`
                      : "—"}
                </Text>
              </View>
              <Text
                style={[
                  styles.histScore,
                  { color: g.isWinner ? colors.gold : colors.cream },
                ]}
              >
                {g.hostScore}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.empty, { color: colors.cream, opacity: 0.5, marginTop: 16 }]}>
          {t("profile.history.empty")}
        </Text>
      )}
    </View>
  );
}

// ─── Friends tab ─────────────────────────────────────────────────────────────

function FriendsTab() {
  const t = useT();
  const { colors } = useTheme();
  return (
    <View>
      <CatalogLine left={t("profile.leaderboardWeek")} right={t("profile.zeroFriends")} />
      <View style={[styles.emptyCard, { borderColor: colors.ink3, marginTop: 10 }]}>
        <Text style={[styles.emptyTitle, { color: colors.cream }]}>
          {t("profile.friends.emptyTitle")}
        </Text>
        <Text style={[styles.emptySoon, { color: colors.gold }]}>
          {t("profile.friends.emptySoon")}
        </Text>
        <Text style={[styles.emptyBody, { color: colors.cream, opacity: 0.65 }]}>
          {t("profile.friends.emptyBody")}
        </Text>
      </View>
      <View style={{ marginTop: 12, opacity: 0.4 }}>
        <YButton variant="ghost" disabled>
          {t("profile.friends.invite")}
        </YButton>
      </View>
    </View>
  );
}

// ─── Settings tab ────────────────────────────────────────────────────────────

function SettingsTab({
  initialName,
  initialEra,
  avatarUrl,
  initial,
  isAnon,
  onAvatarUpload,
  onSave,
  onSignOut,
  onCreateAccount,
}: {
  initialName: string;
  initialEra: Era | null;
  avatarUrl: string | null;
  initial: string;
  isAnon: boolean;
  onAvatarUpload: (file: AvatarFile) => Promise<void>;
  onSave: (name: string | null, era: Era | null) => Promise<void>;
  onSignOut: () => Promise<void>;
  onCreateAccount: () => void;
}) {
  const t = useT();
  const { colors } = useTheme();
  const [name, setName] = useState(initialName);
  const [era, setEra] = useState<Era | null>(initialEra);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialName);
    setEra(initialEra);
  }, [initialName, initialEra]);

  const dirty =
    (name.trim() || null) !== (initialName.trim() || null) || era !== initialEra;

  const handleSave = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const trimmed = name.trim();
      await onSave(trimmed.length > 0 ? trimmed.toUpperCase().slice(0, 20) : null, era);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <SectionHeader title={t("profile.settings.sectionProfile")} />

      <AvatarUploader avatarUrl={avatarUrl} initial={initial} onUpload={onAvatarUpload} />

      <View>
        <FieldLabel>{t("profile.settings.displayName")}</FieldLabel>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={20}
          placeholder="DILNOZA"
          autoCapitalize="characters"
        />
      </View>

      <View>
        <FieldLabel>{t("profile.settings.generation")}</FieldLabel>
        <EraSelect value={era} onChange={setEra} />
      </View>

      {error && <Banner variant="error">{error}</Banner>}

      <YButton onPress={handleSave} disabled={busy || !dirty}>
        {busy
          ? t("profile.settings.saving")
          : dirty
            ? t("profile.settings.save")
            : t("profile.settings.saved")}
      </YButton>

      <SectionHeader title={t("profile.settings.sectionApp")} />

      <ThemeSelect />
      <LanguageSelect />

      <SectionHeader title={t("profile.settings.sectionAccount")} />

      {!isAnon && <PasswordChange />}

      {isAnon ? (
        <View style={{ gap: 8 }}>
          <Banner variant="gold">{t("profile.guestBanner")}</Banner>
          <YButton onPress={onCreateAccount}>{t("profile.createAccount")}</YButton>
        </View>
      ) : (
        <Pressable
          onPress={onSignOut}
          style={[styles.signOutBtn, { borderColor: colors.ink3 }]}
        >
          <Text style={[styles.signOutText, { color: colors.cream, opacity: 0.7 }]}>
            {t("profile.signOut")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── AvatarUploader ──────────────────────────────────────────────────────────

function AvatarUploader({
  avatarUrl,
  initial,
  onUpload,
}: {
  avatarUrl: string | null;
  initial: string;
  onUpload: (file: AvatarFile) => Promise<void>;
}) {
  const t = useT();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async () => {
    if (busy) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError(t("profile.uploadFailed"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType ?? "image/jpeg";
    const ext = mime.split("/")[1] ?? "jpg";
    setBusy(true);
    setError(null);
    try {
      await onUpload({ uri: asset.uri, type: mime, name: `avatar.${ext}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.uploadFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "stretch" }}>
        <Pressable onPress={onPick}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatarSquare, { borderColor: colors.gold }]}
            />
          ) : (
            <View
              style={[
                styles.avatarSquareLetter,
                { backgroundColor: colors.gold, borderColor: colors.gold },
              ]}
            >
              <Text style={[styles.avatarSquareLetterText, { color: colors.ink }]}>
                {initial}
              </Text>
            </View>
          )}
        </Pressable>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <YButton variant="ghost" onPress={onPick} disabled={busy}>
            {busy
              ? t("profile.settings.uploading")
              : avatarUrl
                ? t("profile.settings.replace")
                : t("profile.settings.upload")}
          </YButton>
        </View>
      </View>
      {error && <Banner variant="error">{error}</Banner>}
    </View>
  );
}

// ─── PasswordChange ──────────────────────────────────────────────────────────

function PasswordChange() {
  const t = useT();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onOpen = () => {
    setOpen(true);
    setError(null);
    setSaved(false);
    setNewPw("");
  };

  const onSave = async () => {
    if (busy || newPw.length < 6) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updatePassword(newPw);
      setSaved(true);
      setOpen(false);
      setNewPw("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <FieldLabel>{t("profile.settings.changePassword")}</FieldLabel>
      {!open ? (
        <Pressable
          onPress={onOpen}
          style={[styles.pwDots, { borderColor: colors.ink3, backgroundColor: colors.ink2 }]}
        >
          <Text style={[styles.pwDotsText, { color: colors.cream, opacity: 0.7 }]}>
            ••••••••
          </Text>
        </Pressable>
      ) : (
        <View style={{ gap: 8 }}>
          <TextInput
            value={newPw}
            onChangeText={setNewPw}
            placeholder={t("profile.settings.newPasswordPlaceholder")}
            secureTextEntry
            autoCapitalize="none"
          />
          {error && <Banner variant="error">{error}</Banner>}
          {saved && <Banner variant="gold">{t("profile.settings.saved")}</Banner>}
          <YButton disabled={busy || newPw.length < 6} onPress={onSave}>
            {busy ? t("profile.settings.saving") : t("profile.settings.savePassword")}
          </YButton>
        </View>
      )}
    </View>
  );
}

// ─── ThemeSelect ─────────────────────────────────────────────────────────────

function ThemeSelect() {
  const t = useT();
  const { colors } = useTheme();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);

  return (
    <View>
      <FieldLabel>{t("profile.settings.theme")}</FieldLabel>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {(["dark", "light"] as Theme[]).map((th) => {
          const active = theme === th;
          return (
            <Pressable
              key={th}
              onPress={() => setTheme(th)}
              style={[
                styles.optBtn,
                {
                  borderColor: active ? colors.gold : colors.ink3,
                  backgroundColor: active ? colors.ink2 : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.optBtnText,
                  { color: active ? colors.gold : colors.cream, opacity: active ? 1 : 0.6 },
                ]}
              >
                {th === "dark" ? t("profile.settings.themeDark") : t("profile.settings.themeLight")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── LanguageSelect ──────────────────────────────────────────────────────────

function LanguageSelect() {
  const t = useT();
  const { colors } = useTheme();
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);

  return (
    <View>
      <FieldLabel>{t("profile.settings.language")}</FieldLabel>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {LANGS.map(({ lng, code, Flag }) => {
          const active = language === lng;
          return (
            <Pressable
              key={lng}
              onPress={() => setLanguage(lng)}
              style={[
                styles.optBtn,
                {
                  borderColor: active ? colors.gold : colors.ink3,
                  backgroundColor: active ? colors.ink2 : "transparent",
                  flexDirection: "row",
                  gap: 6,
                },
              ]}
            >
              <Flag width={20} height={14} />
              <Text
                style={[
                  styles.optBtnText,
                  { color: active ? colors.gold : colors.cream, opacity: active ? 1 : 0.6 },
                ]}
              >
                {code}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loading: {
    fontFamily: fonts.condensedBold,
    fontSize: 13,
    letterSpacing: 13 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  signedOutContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  signedOutTitle: {
    fontFamily: fonts.condensedExtraBold,
    fontSize: 22,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 22 * 0.08,
    textAlign: "center",
    includeFontPadding: false,
  },
  signedOutBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: 280,
    includeFontPadding: false,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  avatarWrap: { alignItems: "center", gap: 6 },
  avatarImg: {
    width: 68,
    height: 68,
    borderWidth: 1.5,
  },
  avatarLetter: {
    width: 68,
    height: 68,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetterText: {
    fontFamily: fonts.display,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 38 * -0.02,
    includeFontPadding: false,
  },
  headerInfo: { flex: 1, minWidth: 0 },
  displayName: {
    fontFamily: fonts.condensedExtraBold,
    fontSize: 26,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 26 * 0.06,
    includeFontPadding: false,
  },
  noGeneration: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },

  // TopStats
  topStats: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  statCell: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  statValue: {
    marginTop: 4,
    fontFamily: fonts.monoBold,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 28 * -0.02,
    includeFontPadding: false,
  },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnText: {
    fontFamily: fonts.condensedBold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 10 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  tabContent: { flex: 1 },
  tabContentInner: { padding: 14, paddingBottom: 24 },

  // Stats tab
  eraRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  eraRowName: {
    fontFamily: fonts.condensedBold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 11 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  eraRowMeta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  barTrack: {
    height: 6,
    width: "100%",
    overflow: "hidden",
  },
  barFill: { height: "100%" },
  statCard: {
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  cardLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  cardBigNum: {
    fontFamily: fonts.monoBold,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 32 * -0.02,
    includeFontPadding: false,
  },
  cardSub: {
    fontFamily: fonts.mono,
    fontSize: 11,
    includeFontPadding: false,
  },
  cardEmpty: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontStyle: "italic",
    includeFontPadding: false,
  },

  // History tab
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderLeftWidth: 3,
    gap: 8,
  },
  histMeta: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  histRank: {
    fontFamily: fonts.condensedBold,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 12 * 0.08,
    includeFontPadding: false,
  },
  histScore: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 22 * -0.02,
    includeFontPadding: false,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    includeFontPadding: false,
  },

  // Friends tab
  emptyCard: {
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: fonts.condensedBold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 14 * 0.08,
    includeFontPadding: false,
  },
  emptySoon: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    includeFontPadding: false,
  },

  // Settings tab
  signOutBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: fonts.condensedBold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 11 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  avatarSquare: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
  },
  avatarSquareLetter: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSquareLetterText: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "900",
    includeFontPadding: false,
  },
  pwDots: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  pwDotsText: {
    fontFamily: fonts.mono,
    fontSize: 16,
    letterSpacing: 16 * 0.1,
    includeFontPadding: false,
  },
  optBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optBtnText: {
    fontFamily: fonts.condensedBold,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 11 * 0.12,
    includeFontPadding: false,
  },
});

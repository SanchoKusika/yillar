import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CatalogLine, EraTag, GirihOverlay, PhoneFrame, YButton } from "@shared/ui";
import { env } from "@shared/config";
import { ERAS, ERA_LABEL, useT, LANGUAGE_LABEL, type Era } from "@shared/lib";
import { signOut, updateProfile, uploadAvatar, useSessionStore } from "@entities/session";
import { useHistory, useProfileStats } from "@entities/game-history";
import type { EraBreakdownEntry } from "@entities/game-history";
import { usePreferencesStore, type Language, type Theme } from "@entities/preferences";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "./ProfilePage.module.css";

type Tab = "stats" | "history" | "friends" | "settings";

const TAB_KEYS: Tab[] = ["stats", "history", "friends", "settings"];

export function ProfilePage() {
  const navigate = useNavigate();
  const t = useT();
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
        <div className="flex flex-1 items-center justify-center p-6 type-h2 text-cream opacity-60">
          {t("profile.loadingPage")}
        </div>
      </PhoneFrame>
    );
  }

  if (!user) {
    return (
      <PhoneFrame>
        <div className="relative flex h-full flex-col">
          <GirihOverlay size={200} opacity={0.05} />
          <div className="relative border-b border-gold px-[18px] py-[14px]">
            <CatalogLine left={t("profile.headerLeft")} right={t("profile.notSignedIn")} />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="font-condensed text-[22px] font-extrabold uppercase tracking-[0.08em] text-cream">
              {t("profile.signedOut.title")}
            </div>
            <div className="max-w-[280px] text-[13px] italic text-cream opacity-65">
              {t("profile.signedOut.body")}
            </div>
            <YButton onClick={() => navigate("/auth")}>{t("profile.signedOut.cta")}</YButton>
          </div>
          <BottomNav />
        </div>
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
      <div className="relative flex h-full flex-col bg-ink text-cream overflow-hidden">
        <GirihOverlay size={220} opacity={0.05} />

        <div className="relative border-b border-gold px-[18px] py-[14px]">
          <CatalogLine
            left={t("profile.headerLeft")}
            right={isAnon ? t("profile.statusGuest") : t("profile.statusMember")}
          />
        </div>

        <div className="relative border-b border-ink-3 px-4 py-4">
          <div className="flex items-center gap-[14px]">
            <div className={styles.avatarWrap}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className={styles.avatarImg} />
              ) : (
                <div
                  className={styles.avatarLetter}
                  style={{
                    background: era ? `var(--color-${era}-primary)` : "var(--color-gold)",
                    color: era ? `var(--color-${era}-surface)` : "var(--color-ink)",
                  }}
                >
                  {initial}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="font-condensed text-[26px] font-extrabold uppercase tracking-[0.06em] leading-none text-cream">
                {displayName}
              </div>
              <div className="mt-[6px]">
                {era ? (
                  <EraTag era={era} boxed onDark />
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold opacity-60">
                    {t("profile.noGeneration")}
                  </span>
                )}
              </div>
              <div className="mt-[6px] truncate font-mono text-[9px] uppercase tracking-[0.18em] text-cream opacity-50">
                {isAnon ? t("profile.guestSubtitle") : user.email ? user.email : t("profile.memberSubtitle")}
              </div>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 border-b border-gold">
          <TopStat label={t("profile.statBest")} value={stats.data?.bestScore} />
          <TopStat label={t("profile.statAvg")} value={stats.data?.averageScore} bordered />
          <TopStat label={t("profile.statPlayed")} value={stats.data?.gamesPlayed} bordered />
        </div>

        <div className="relative flex border-b border-ink-3">
          {TAB_KEYS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={styles.tabBtn}
              data-active={tab === id}
            >
              {t(`profile.tabs.${id}` as const)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 overflow-auto px-[14px] pb-2 pt-[14px]">
          {tab === "stats" && (
            <StatsTab
              eraBreakdown={stats.data?.eraBreakdown}
              bestDecade={stats.data?.bestDecade}
              wins={stats.data?.wins}
              loading={stats.isLoading}
            />
          )}

          {tab === "history" && <HistoryTab entries={history.data} loading={history.isLoading} />}

          {tab === "friends" && <FriendsTab />}

          {tab === "settings" && (
            <SettingsTab
              initialName={profile?.displayName ?? ""}
              initialEra={profile?.generation ?? null}
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
                if (profile) setProfile({ ...profile, displayName: name, generation: gen });
              }}
              onSignOut={async () => {
                try {
                  await signOut();
                } catch (err) {
                  console.warn("[YILLAR] sign out failed:", err);
                }
                navigate("/auth", { replace: true });
              }}
              onCreateAccount={() => navigate("/auth")}
            />
          )}

          {!env.hasSupabase && (
            <div className="mt-4 border border-danger px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-danger">
              {t("profile.demoMode")}
            </div>
          )}
        </div>

        <div className="flex h-[6px]">
          <div className="flex-1 bg-klassika-primary" />
          <div className="flex-1 bg-kasseta-primary" />
          <div className="flex-1 bg-tsifra-primary" />
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

function TopStat({
  label,
  value,
  bordered,
}: {
  label: string;
  value: number | null | undefined;
  bordered?: boolean;
}) {
  const v = value == null ? "—" : value;
  return (
    <div className={`px-[10px] py-3 text-center ${bordered ? "border-l border-ink-3" : ""}`}>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">{label}</div>
      <div
        className="mt-1 font-display text-[28px] font-black leading-none text-cream"
        style={{ letterSpacing: "-0.02em" }}
      >
        {v}
      </div>
    </div>
  );
}

function StatsTab({
  eraBreakdown,
  bestDecade,
  wins,
  loading,
}: {
  eraBreakdown: EraBreakdownEntry[] | undefined;
  bestDecade:
    | { decade: number; correct: number; total: number; accuracy: number }
    | null
    | undefined;
  wins: number | undefined;
  loading: boolean;
}) {
  const t = useT();
  if (loading) {
    return (
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream opacity-60">
        {t("profile.loading")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <CatalogLine
          left={t("profile.eraBreakdown")}
          right={t("profile.uniqueGuessed")}
          style={{ marginBottom: 10 }}
        />
        {(eraBreakdown ?? []).map((r) => {
          const pct = r.total > 0 ? (r.correct / r.total) * 100 : 0;
          return (
            <div key={r.era} className="mb-3 last:mb-0">
              <div className="mb-[4px] flex justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                <span style={{ color: `var(--color-${r.era}-primary)` }}>{ERA_LABEL[r.era]}</span>
                <span className="opacity-70 tabular-nums">
                  {r.correct} / {r.total} {t("profile.tracksWord")} · {Math.round(pct)}%
                </span>
              </div>
              <div className="flex h-[14px] border border-ink-3 bg-ink-2">
                <div
                  className="transition-[width] duration-500"
                  style={{
                    width: `${pct}%`,
                    background: `var(--color-${r.era}-primary)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-ink-3 bg-ink-2 px-3 py-[10px]">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">{t("profile.bestDecade")}</div>
        {bestDecade ? (
          <>
            <div
              className="mt-1 font-display text-[36px] font-black leading-none text-cream"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t("profile.decadeFormat", { n: bestDecade.decade })}
            </div>
            <div className="mt-[2px] font-mono text-[10px] uppercase tracking-[0.1em] text-cream opacity-60">
              {bestDecade.correct}/{bestDecade.total} {t("profile.songsWord")} · {Math.round(bestDecade.accuracy * 100)}%
            </div>
          </>
        ) : (
          <div className="mt-1 font-mono text-[12px] italic text-cream opacity-55">
            {t("profile.bestDecade.empty")}
          </div>
        )}
      </div>

      <div className="border border-ink-3 bg-ink-2 px-3 py-[10px]">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">{t("profile.wins")}</div>
        <div
          className="mt-1 font-display text-[28px] font-black leading-none text-cream"
          style={{ letterSpacing: "-0.02em" }}
        >
          {wins ?? "—"}
        </div>
      </div>
    </div>
  );
}

function HistoryTab({
  entries,
  loading,
}: {
  entries:
    | {
        id: string;
        startedAt: string;
        totalCards: number;
        hostScore: number;
        hostRank: number | null;
        isWinner: boolean;
        playerCount: number;
      }[]
    | undefined;
  loading: boolean;
}) {
  const t = useT();
  return (
    <div>
      <CatalogLine
        left={t("profile.lastSessions")}
        right={`${entries?.length ?? 0}`}
        style={{ marginBottom: 10 }}
      />
      {loading ? (
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream opacity-60">
          {t("profile.loading")}
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="flex flex-col gap-[6px]">
          {entries.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between border border-ink-3 bg-ink-2 px-3 py-[10px]"
              style={{
                borderLeft: `3px solid ${g.isWinner ? "var(--color-gold)" : "var(--color-ink-3)"}`,
              }}
            >
              <div className="flex flex-col gap-[2px]">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold opacity-80">
                  {formatDate(g.startedAt)} · {g.playerCount} {t("profile.players")}
                </span>
                <span className="font-condensed text-[14px] font-bold uppercase tracking-[0.1em] text-cream">
                  {g.isWinner
                    ? t("profile.winnerStar")
                    : g.hostRank
                      ? `# ${t("profile.placeBadge", { n: g.hostRank })}`
                      : "—"}
                </span>
              </div>
              <div
                className="font-display text-[26px] font-black leading-none"
                style={{
                  letterSpacing: "-0.02em",
                  color: g.isWinner ? "var(--color-gold)" : "var(--color-cream)",
                }}
              >
                {g.hostScore}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-ink-3 px-3 py-4 text-center text-[12px] italic text-cream opacity-55">
          {t("profile.history.empty")}
        </div>
      )}
    </div>
  );
}

function FriendsTab() {
  const t = useT();
  return (
    <div>
      <CatalogLine
        left={t("profile.leaderboardWeek")}
        right={t("profile.zeroFriends")}
        style={{ marginBottom: 10 }}
      />

      <div className="border border-ink-3 bg-ink-2 px-4 py-6 text-center">
        <div className="font-condensed text-[16px] font-bold uppercase tracking-[0.1em] text-cream">
          {t("profile.friends.emptyTitle")}
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cream opacity-55">
          {t("profile.friends.emptySoon")}
        </div>
        <div className="mt-3 font-body text-[12px] italic text-cream opacity-65">
          {t("profile.friends.emptyBody")}
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-3 w-full cursor-not-allowed border-0 bg-transparent px-3 py-[10px] font-condensed text-[11px] font-bold uppercase tracking-[0.2em] text-cream opacity-40 outline outline-1 outline-cream"
      >
        {t("profile.friends.invite")}
      </button>
    </div>
  );
}

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
  onAvatarUpload: (file: File) => Promise<void>;
  onSave: (name: string | null, era: Era | null) => Promise<void>;
  onSignOut: () => Promise<void>;
  onCreateAccount: () => void;
}) {
  const t = useT();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);

  const [name, setName] = useState(initialName);
  const [era, setEra] = useState<Era | null>(initialEra);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(initialName);
    setEra(initialEra);
  }, [initialName, initialEra]);

  const dirty = (name.trim() || null) !== (initialName.trim() || null) || era !== initialEra;

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      await onAvatarUpload(file);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t("profile.uploadFailed"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSave = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const trimmed = name.trim();
      const next = trimmed.length > 0 ? trimmed.toUpperCase().slice(0, 20) : null;
      await onSave(next, era);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onAvatarChange}
      />

      <div className={styles.settingRow}>
        <div className="flex-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
            {t("profile.settings.avatar")}
          </div>
          <div className="mt-[6px] flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="aspect-square w-12 shrink-0 border border-gold object-cover"
              />
            ) : (
              <div className="flex aspect-square w-12 shrink-0 items-center justify-center bg-gold font-display text-[20px] font-black text-ink">
                {initial}
              </div>
            )}
            <YButton variant="ghost" onClick={onPickAvatar} disabled={avatarBusy}>
              {avatarBusy
                ? t("profile.settings.uploading")
                : avatarUrl
                  ? t("profile.settings.replace")
                  : t("profile.settings.upload")}
            </YButton>
          </div>
          <span className="mt-[6px] block font-mono text-[9px] uppercase tracking-[0.18em] text-cream opacity-55">
            {t("profile.settings.avatarHint")}
          </span>
          {avatarError && (
            <div className="mt-2 border border-danger px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-danger">
              {avatarError}
            </div>
          )}
        </div>
      </div>

      <div className={styles.settingRow}>
        <label className="flex w-full flex-col gap-[6px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
            {t("profile.settings.displayName")}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="DILNOZA"
            className="border border-ink-3 bg-ink px-3 py-2 font-condensed text-[16px] font-bold uppercase tracking-[0.08em] text-cream outline-none focus:border-gold"
          />
        </label>
      </div>

      <div className={styles.settingRow}>
        <div className="flex w-full flex-col gap-[6px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
            {t("profile.settings.generation")}
          </span>
          <div className="grid grid-cols-3 gap-[6px]">
            {ERAS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEra(e)}
                className="border px-2 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{
                  borderColor: era === e ? `var(--color-${e}-primary)` : "var(--color-ink-3)",
                  background: era === e ? `var(--color-${e}-primary)` : "transparent",
                  color: era === e ? "var(--color-ink)" : "var(--color-cream)",
                }}
              >
                <div className="opacity-80">{ERA_LABEL[e]}</div>
                <div>{t(`era.${e}` as const)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.settingRow}>
        <div className="flex w-full flex-col gap-[6px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
            {t("profile.settings.theme")}
          </span>
          <div className="grid grid-cols-2 gap-[6px]">
            {(["dark", "light"] as Theme[]).map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setTheme(th)}
                className="border px-2 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{
                  borderColor: theme === th ? "var(--color-gold)" : "var(--color-ink-3)",
                  background: theme === th ? "var(--color-gold)" : "transparent",
                  color: theme === th ? "var(--color-ink)" : "var(--color-cream)",
                }}
              >
                {th === "dark"
                  ? t("profile.settings.themeDark")
                  : t("profile.settings.themeLight")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.settingRow}>
        <div className="flex w-full flex-col gap-[6px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
            {t("profile.settings.language")}
          </span>
          <div className="grid grid-cols-3 gap-[6px]">
            {(["ru", "uz", "en"] as Language[]).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => setLanguage(lng)}
                className="border px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{
                  borderColor: language === lng ? "var(--color-gold)" : "var(--color-ink-3)",
                  background: language === lng ? "var(--color-gold)" : "transparent",
                  color: language === lng ? "var(--color-ink)" : "var(--color-cream)",
                }}
              >
                {LANGUAGE_LABEL[lng]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="border border-danger px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-danger">
          {error}
        </div>
      )}

      <YButton onClick={handleSave} disabled={busy || !dirty}>
        {busy
          ? t("profile.settings.saving")
          : dirty
            ? t("profile.settings.save")
            : t("profile.settings.saved")}
      </YButton>

      <div className="mt-2">
        {isAnon ? (
          <div className="flex flex-col gap-2">
            <div className="border border-gold px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
              {t("profile.guestBanner")}
            </div>
            <YButton onClick={onCreateAccount}>{t("profile.createAccount")}</YButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full border-0 bg-transparent px-3 py-[10px] font-condensed text-[11px] font-bold uppercase tracking-[0.2em] text-danger outline outline-1 outline-danger"
          >
            {t("profile.signOut")}
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

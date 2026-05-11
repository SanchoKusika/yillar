import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banner, GirihOverlay, PhoneFrame, YButton } from "@shared/ui";
import { env } from "@shared/config";
import { useT } from "@shared/lib";
import { signOut, updateProfile, uploadAvatar, useSessionStore } from "@entities/session";
import { useHistory, useProfileStats } from "@entities/game-history";
import { BottomNav } from "@widgets/bottom-nav";
import { ProfileHeader } from "./ProfileHeader";
import { TopStats } from "./TopStats";
import { StatsTab } from "./tabs/StatsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { FriendsTab } from "./tabs/FriendsTab";
import { SettingsTab } from "./tabs/SettingsTab";
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

        <nav className="relative flex border-b border-ink-3" aria-label="profile tabs">
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
        </nav>

        <section className="relative flex-1 overflow-auto px-[14px] pb-2 pt-[14px]">
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
                if (profile) setProfile({ ...profile, displayName: name ?? undefined, generation: gen ?? undefined });
              }}
              onSignOut={async () => {
                try { await signOut(); } catch (err) { console.warn("[YILLAR] sign out failed:", err); }
                navigate("/auth", { replace: true });
              }}
              onCreateAccount={() => navigate("/auth")}
            />
          )}

          {!env.hasSupabase && (
            <div className="mt-4">
              <Banner variant="error">{t("profile.demoMode")}</Banner>
            </div>
          )}
        </section>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

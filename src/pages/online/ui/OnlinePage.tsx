import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GirihOverlay, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { env } from "@shared/config";
import { useT, haptic } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { createRoom, joinRoom } from "@entities/room";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "./OnlinePage.module.css";

export function OnlinePage() {
  const navigate = useNavigate();
  const t = useT();
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
      navigate(`/online/room/${room.code}`);
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
      navigate(`/online/room/${room.code}`);
    } catch (err) {
      const msg = err instanceof Error && err.message === "room-full"
        ? t("online.roomFull")
        : t("online.roomNotFound");
      setError(msg);
      setBusy(null);
    }
  };

  const noSupabase = !env.supabaseUrl;

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col">
        <GirihOverlay size={220} opacity={0.04} />

        <header className={styles.pageHeader}>
          <div className={styles.headerTopRow}>
            <span className={styles.headerBadgeLeft}>
              {noSupabase ? t("home.demo") : "● ONLINE"}
            </span>
            <span className={styles.headerBadgeRight}>
              {t("home.headerLeft")}
            </span>
          </div>
          <div className="inline-block">
            <Wordmark color="var(--color-gold)" size={48} />
          </div>
        </header>

        <div className="h-px bg-gold/50" />

        {noSupabase ? (
          <div className={styles.demoCenter}>
            <div>
              <div className={styles.demoBadge}>● DEMO MODE</div>
              <div className={styles.demoTitle}>{t("online.soon")}</div>
              <div className={styles.demoSub}>{t("online.soonSub")}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            {/* CREATE */}
            <button
              type="button"
              className={styles.createBlock}
              onClick={onCreate}
              disabled={busy !== null}
              aria-label={t("online.create")}
            >
              <GirihOverlay size={160} opacity={0.04} />
              <div className={styles.modeLabel}>{t("online.createLabel")}</div>
              <div className={styles.modeName}>
                {busy === "create" ? t("online.creating") : t("online.create")}
              </div>
              <span className={styles.modeArrow}>→</span>
            </button>

            <div className={styles.divider} />

            {/* JOIN */}
            <div className={styles.joinBlock}>
              <GirihOverlay size={160} opacity={0.025} />
              <div className={styles.modeLabel}>{t("online.joinLabel")}</div>
              <input
                className={styles.codeInput}
                type="text"
                inputMode="text"
                maxLength={4}
                placeholder="XXXX"
                value={code}
                onChange={(e) => {
                  setError(null);
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 4));
                }}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              {error && <div className={styles.error}>{error}</div>}
              <YButton
                disabled={code.length < 4 || busy !== null}
                onClick={onJoin}
              >
                {busy === "join" ? t("online.joining") : t("online.joinBtn")}
              </YButton>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

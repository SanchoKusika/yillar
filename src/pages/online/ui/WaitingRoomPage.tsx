import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EraSelect, GirihOverlay, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { CatalogLine } from "@shared/ui";
import { useT, haptic, type Era } from "@shared/lib";
import { env } from "@shared/config";
import { useSessionStore } from "@entities/session";
import { getTracks } from "@entities/track";
import {
  useRoom,
  useRoomPlayers,
  updateRoomPlayer,
  startGame,
  leaveRoom,
  deleteRoom,
  ensureInRoom,
} from "@entities/room";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "./WaitingRoomPage.module.css";

export function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const t = useT();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  const room = useRoom(code ?? null);
  const players = useRoomPlayers(room?.id ?? null);
  const myPlayer = players.find((p) => p.playerId === user?.id);

  const [localName, setLocalName] = useState(profile?.displayName ?? "");
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const ensuredRef = useRef(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!room || !user || ensuredRef.current) return;
    if (room.status !== "waiting") return;
    ensuredRef.current = true;
    void ensureInRoom(room.id, user.id, localName || (profile?.displayName ?? ""));
  }, [room?.id, room?.status, user?.id]);

  // Trigger countdown when game starts
  useEffect(() => {
    if (room?.status === "playing" && countdown === null) {
      setCountdown(3);
    }
  }, [room?.status, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate(`/online/game/${code}`, { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate, code]);

  // Sync local name once myPlayer loads
  useEffect(() => {
    if (myPlayer?.name && !localName) {
      setLocalName(myPlayer.name);
    }
  }, [myPlayer?.name]);

  const handleNameBlur = () => {
    if (!room || !user || !localName.trim()) return;
    void updateRoomPlayer(room.id, user.id, { name: localName.trim() });
  };

  const handleEra = (era: Era) => {
    if (!room || !user) return;
    haptic("light");
    void updateRoomPlayer(room.id, user.id, { era });
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(code ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!room || !user) return;
    haptic("light");
    if (myPlayer?.isHost) {
      await deleteRoom(room.id); // cascades to room_players
    } else {
      await leaveRoom(room.id, user.id);
    }
    navigate("/online");
  };

  const allReady = players.length >= 2 && players.every((p) => p.name && p.era);

  const handleStart = async () => {
    if (!room || !myPlayer?.isHost || !allReady || starting) return;
    setStarting(true);
    haptic("medium");
    try {
      const tracks = await getTracks(12);
      await startGame(room.id, tracks.map((tr) => tr.id));
    } catch {
      setStarting(false);
    }
  };

  if (!room) {
    return (
      <PhoneFrame>
        <div className="flex h-full items-center justify-center">
          <span className={styles.loadingLabel}>{t("online.waitLoading")}</span>
        </div>
      </PhoneFrame>
    );
  }

  const startLabel = (() => {
    if (starting) return t("online.creating");
    if (players.length < 2) return t("online.waitNeedPlayers");
    if (!allReady) return t("online.waitNeedEra");
    return t("online.waitStart", { n: players.length });
  })();

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col">
        {countdown !== null && countdown > 0 && (
          <div className={styles.countOverlay}>
            <div key={countdown} className={styles.countNum}>{countdown}</div>
          </div>
        )}
        <GirihOverlay size={200} opacity={0.05} />

        {/* Header — matches LobbyPage */}
        <header className="relative px-5 pt-6 pb-[18px] text-center">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className={styles.headerBadgeLeft}>
              {env.supabaseUrl ? "● ONLINE" : t("home.demo")}
            </span>
            <button
              type="button"
              onClick={handleLeave}
              className={styles.leaveBtn}
            >
              {t("online.waitBack")}
            </button>
          </div>
          <div className="inline-block">
            <Wordmark color="var(--color-gold)" size={48} />
          </div>
        </header>

        <div className="h-px bg-gold/50" />

        {/* Room code banner — compact */}
        <div className={styles.codeBanner}>
          <div className={styles.codeGroup}>
            <span className={styles.codeLabel}>{t("online.waitCode")}</span>
            <span className={styles.codeValue}>{code}</span>
          </div>
          <button
            type="button"
            className={styles.copyBtn}
            onClick={handleCopy}
            data-copied={copied}
          >
            {copied ? t("online.waitCopied") : t("online.waitCopy")}
          </button>
        </div>

        {/* Players roster — same style as PlayerRoster */}
        <div className="relative flex-1 overflow-auto px-4 pt-[14px] pb-4">
          <CatalogLine
            left={t("online.waitPlayers", { n: players.length })}
            right={`${players.filter((p) => p.name && p.era).length} / ${players.length}`}
            style={{ marginBottom: 10 }}
          />

          <ul>
            {players.map((p, idx) => {
              const isMe = p.playerId === user?.id;
              const filled = !!(p.name && p.era);

              return (
                <li
                  key={p.id}
                  className={styles.playerRow}
                  data-filled={filled}
                  style={{ borderLeftColor: filled && p.era ? `var(--color-${p.era}-primary)` : undefined }}
                >
                  <div className={styles.playerMeta}>
                    <span className={styles.playerLabel}>
                      {`${t("roster.playerPrefix")}${String(idx + 1).padStart(2, "0")}`}
                    </span>

                    {p.isHost && (
                      <span className={styles.badge}>{t("online.waitHost")}</span>
                    )}
                    {isMe && !p.isHost && (
                      <span className={styles.badge}>{t("online.waitYou")}</span>
                    )}

                    {isMe ? (
                      <input
                        className={styles.nameInput}
                        type="text"
                        maxLength={12}
                        placeholder={t("online.waitNamePh")}
                        value={localName}
                        onChange={(e) =>
                          setLocalName(e.target.value.toUpperCase().slice(0, 12))
                        }
                        onBlur={handleNameBlur}
                        data-filled={localName.length > 0}
                        autoCapitalize="characters"
                        autoCorrect="off"
                      />
                    ) : (
                      <span className={styles.playerNameStatic}>{p.name || "…"}</span>
                    )}

                    <span className={filled ? styles.readyDot : styles.notReadyDot} />
                  </div>

                  {isMe ? (
                    <EraSelect
                      value={myPlayer?.era ?? null}
                      onChange={handleEra}
                    />
                  ) : p.era ? (
                    <div className="pt-[2px]">
                      <EraSelect value={p.era} onChange={() => {}} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className={styles.hint}>{t("roster.hint")}</div>
        </div>

        <footer className="border-t border-gold bg-ink p-[14px]">
          {myPlayer?.isHost ? (
            <YButton disabled={!allReady || starting} onClick={handleStart}>
              {startLabel}
            </YButton>
          ) : (
            <div className={`${styles.waitingFooterText} ${styles.waitingPulse}`}>
              {t("online.waitWaiting")}
            </div>
          )}
        </footer>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

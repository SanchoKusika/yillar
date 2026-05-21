import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CatalogLine, GirihOverlay, PhoneFrame, YButton } from "@shared/ui";
import { useT, haptic, calcScore, ERAS, eraVar, CORRECT_THRESHOLD_YEARS } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { getTrackById } from "@entities/track";
import type { Track } from "@entities/track";
import type { Placement } from "@entities/placement";
import { useRoom, useRoomPlayers, getRoomGuesses, resetRoom } from "@entities/room";
import { saveGame } from "@features/save-game";
import { useProfileStats } from "@entities/game-history";
import { BottomNav } from "@widgets/bottom-nav";
import StarMark from "@shared/assets/svg/star-mark.svg?react";
import styles from "./OnlineEndPage.module.css";

type PlayerResult = {
  playerId: string;
  name: string;
  era: string | null;
  isHost: boolean;
  totalPts: number;
  placements: Placement[];
};

export function OnlineEndPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const t = useT();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  const room = useRoom(code ?? null);
  const players = useRoomPlayers(room?.id ?? null);
  const myPlayer = players.find((p) => p.playerId === user?.id);

  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [rematching, setRematching] = useState(false);
  const [waitingRematch, setWaitingRematch] = useState(false);
  const savedRef = useRef(false);

  const stats = useProfileStats(user?.id);

  // Non-hosts: follow host back to waiting room on rematch
  useEffect(() => {
    if (room?.status === "waiting") {
      navigate(`/online/room/${code}`, { replace: true });
    }
  }, [room?.status, code, navigate]);

  useEffect(() => {
    if (!room || players.length === 0) return;

    const compute = async () => {
      const allGuesses = await getRoomGuesses(room.id);

      const trackMap = new Map<string, Track>();
      await Promise.all(
        room.trackIds.map(async (id) => {
          const tr = await getTrackById(id);
          if (tr) trackMap.set(id, tr);
        })
      );

      const playerResults: PlayerResult[] = players.map((p) => {
        const placements: Placement[] = [];

        for (let idx = 0; idx < room.trackIds.length; idx++) {
          const trackId = room.trackIds[idx];
          const track = trackId ? trackMap.get(trackId) : undefined;
          const guess = allGuesses.find((g) => g.trackIdx === idx && g.playerId === p.playerId);
          if (!track || !guess || !p.era) continue;

          const score = calcScore({ guess: guess.guessYear, truth: track.year, playerEra: p.era as "klassika" | "kasseta" | "tsifra" });
          placements.push({
            trackId: track.id,
            guess: guess.guessYear,
            truth: track.year,
            delta: score.delta,
            base: score.base,
            multiplier: score.multiplier,
            bonus: score.bonus,
            points: score.points,
            era: track.era,
            title: track.title,
            artist: track.artist,
            correct: score.delta <= CORRECT_THRESHOLD_YEARS,
            skipped: false,
          });
        }

        const totalPts = placements.reduce((sum, pl) => sum + pl.points, 0);
        return { playerId: p.playerId, name: p.name, era: p.era, isHost: p.isHost, totalPts, placements };
      });

      const ranked = playerResults.sort((a, b) => b.totalPts - a.totalPts);
      setResults(ranked);
      setLoading(false);

      // Host saves the game once
      if (myPlayer?.isHost && !savedRef.current && user) {
        savedRef.current = true;
        const hostName = profile?.displayName?.toUpperCase() || myPlayer.name;
        void saveGame({
          hostId: user.id,
          totalCards: room.trackIds.length,
          players: ranked.map((r, i) => ({
            displayName: r.isHost ? hostName : r.name,
            generation: r.era as "klassika" | "kasseta" | "tsifra" | null,
            totalScore: r.totalPts,
            rank: i + 1,
            isWinner: i === 0,
            isHost: r.isHost,
            placements: r.placements,
          })),
        }).catch(() => { savedRef.current = false; });
      }
    };

    void compute();
  }, [room?.id, players.length]);

  const winner = results[0];
  const isNewRecord =
    winner?.playerId === user?.id &&
    stats.data?.bestScore != null &&
    winner.totalPts > stats.data.bestScore;

  const PARTICLES = [
    { left: "12%", top: "60%", dur: "1.8s", delay: "0s" },
    { left: "28%", top: "75%", dur: "2.2s", delay: "0.15s" },
    { left: "50%", top: "55%", dur: "1.9s", delay: "0.3s" },
    { left: "68%", top: "70%", dur: "2.1s", delay: "0.1s" },
    { left: "82%", top: "62%", dur: "2.0s", delay: "0.25s" },
    { left: "38%", top: "80%", dur: "1.7s", delay: "0.4s" },
  ];

  return (
    <PhoneFrame>
      <main className="relative flex h-full flex-col overflow-hidden bg-ink text-cream">
        <GirihOverlay size={200} opacity={0.05} />

        <header className="relative border-b border-gold px-5 pt-[18px] pb-[14px] overflow-hidden">
          {!loading && winner && PARTICLES.map((p, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{ left: p.left, top: p.top, ["--dur" as string]: p.dur, ["--delay" as string]: p.delay }}
            />
          ))}

          <div className="mb-1 flex items-center justify-between">
            <span className={styles.onlineBadge}>ONLINE</span>
            <span className={styles.headerBadgeRight}>
              {t("end.headerFinal", { placed: room?.trackIds.length ?? 0, total: room?.trackIds.length ?? 0 })}
            </span>
          </div>

          {loading ? (
            <div className={styles.loadingLabel}>{t("online.waitLoading")}</div>
          ) : winner ? (
            <>
              <div className={styles.winnerLabel}>{t("end.winner")}</div>
              <div
                className={styles.winnerName}
                style={{
                  fontSize: winner.name.length <= 6 ? 64 : winner.name.length <= 9 ? 50 : 38,
                  letterSpacing: "-0.02em",
                }}
              >
                {winner.name}
              </div>
              {isNewRecord && <div className={styles.newRecord}>{t("end.newRecord")}</div>}
              <div className={styles.winnerMeta}>
                <span className={styles.winnerPoints}>{winner.totalPts} {t("end.points")}</span>
                <span className={styles.winnerGen}>
                  {t("end.gen")} {winner.era ? t(`era.${winner.era as "klassika" | "kasseta" | "tsifra"}`) : "—"}
                </span>
              </div>
            </>
          ) : null}
        </header>

        {!loading && (
          <div className="flex-1 overflow-auto px-4 pb-2 pt-[14px]">
            <CatalogLine
              left={t("end.perPlayer")}
              right={t("end.playersCount", { n: results.length })}
              style={{ marginBottom: 10 }}
            />

            <ol>
              {results.map((r, i) => {
                const isMe = r.playerId === user?.id;
                const eraStats = ERAS.map((era) => {
                  const ofEra = r.placements.filter((pl) => pl.era === era);
                  return { era, correct: ofEra.filter((pl) => pl.correct).length, total: ofEra.length };
                });

                return (
                  <li key={r.playerId} className={styles.playerCard} data-winner={i === 0}>
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex flex-col gap-[2px]">
                        <span className={styles.placeBadge}>#{t("end.placeBadge", { n: i + 1 })}</span>
                        <div className="flex items-baseline gap-2">
                          <span className={styles.playerName} style={{ opacity: i === 0 ? 1 : 0.85 }}>
                            {r.name}
                            {isMe && (
                              <span className={styles.youBadge}>
                                {t("online.revealYou")}
                              </span>
                            )}
                          </span>
                          {i === 0 && <StarMark className={styles.starMark} aria-hidden />}
                        </div>
                      </div>
                      <span
                        className={styles.playerScore}
                        style={{ color: i === 0 ? "var(--color-gold)" : "var(--color-cream)" }}
                      >
                        {r.totalPts}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {eraStats.map(({ era, correct, total }) => (
                        <div key={era}>
                          <div className={`mb-[2px] flex justify-between ${styles.eraLabel}`}>
                            <span style={{ color: eraVar(era, "primary") }}>{t(`era.short.${era}` as const)}</span>
                            <span className="opacity-60">{correct}/{total || 0}</span>
                          </div>
                          <div className="flex h-2 gap-px bg-ink">
                            {[...Array(Math.max(total, 1))].map((_, j) => (
                              <div
                                key={j}
                                className="flex-1"
                                style={{ background: j < correct ? eraVar(era, "primary") : "var(--color-ink-3)" }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {r.era && (
                      <div className={styles.bonusGen}>
                        {t("end.bonusGen", { era: t(`era.${r.era as "klassika" | "kasseta" | "tsifra"}`) })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <footer className="flex gap-2 border-t border-gold bg-ink p-3">
          <YButton
            variant="ghost"
            style={{ width: 110, flexShrink: 0 }}
            onClick={() => {
              haptic("light");
              navigate("/");
            }}
          >
            {t("online.endBack")}
          </YButton>
          {waitingRematch ? (
            <div className={`${styles.waitingRematch} ${styles.waitingPulse}`}>
              {t("online.waitWaiting")}
            </div>
          ) : (
            <YButton
              disabled={rematching}
              onClick={async () => {
                haptic("medium");
                if (myPlayer?.isHost && room) {
                  setRematching(true);
                  await resetRoom(room.id);
                  navigate(`/online/room/${code}`, { replace: true });
                } else {
                  setWaitingRematch(true);
                }
              }}
            >
              {t("online.endPlayAgain")}
            </YButton>
          )}
        </footer>

        <BottomNav />
      </main>
    </PhoneFrame>
  );
}

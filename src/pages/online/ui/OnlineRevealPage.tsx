import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GirihOverlay, Multiplier, PaperGrain, PhoneFrame, YButton } from "@shared/ui";
import { useT, haptic, calcScore, ERA_LABEL, eraVar, CORRECT_THRESHOLD_YEARS } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { getTrackById } from "@entities/track";
import type { Track } from "@entities/track";
import { useRoom, useRoomPlayers, useRoomGuesses, advanceTrack, getRoomGuesses } from "@entities/room";
import type { RoomGuess } from "@entities/room";
import styles from "./OnlineRevealPage.module.css";

const STAR_POINTS =
  "0,-30 6,-13 23,-17 12,-4 30,0 12,4 23,17 6,13 0,30 -6,13 -23,17 -12,4 -30,0 -12,-4 -23,-17 -6,-13";

function StarShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <g transform="translate(32 32)">
        <polygon fill="currentColor" points={STAR_POINTS} />
      </g>
    </svg>
  );
}

export function OnlineRevealPage() {
  const { code, trackIdx: trackIdxStr } = useParams<{ code: string; trackIdx: string }>();
  const navigate = useNavigate();
  const t = useT();
  const user = useSessionStore((s) => s.user);

  const trackIdx = parseInt(trackIdxStr ?? "0", 10);

  const room = useRoom(code ?? null);
  const players = useRoomPlayers(room?.id ?? null);
  const guesses = useRoomGuesses(room?.id ?? null, trackIdx);
  const myPlayer = players.find((p) => p.playerId === user?.id);
  const isHost = myPlayer?.isHost ?? false;

  const [track, setTrack] = useState<Track | null>(null);
  const [stage, setStage] = useState(0);
  const [allGuesses, setAllGuesses] = useState<RoomGuess[]>([]);
  const [prevTracksMap, setPrevTracksMap] = useState<Map<number, Track>>(new Map());

  useEffect(() => {
    const trackId = room?.trackIds[trackIdx];
    if (!trackId) return;
    void getTrackById(trackId).then(setTrack);
  }, [room?.trackIds, trackIdx]);

  useEffect(() => {
    if (!room?.id) return;
    void getRoomGuesses(room.id).then(setAllGuesses);
  }, [room?.id, trackIdx]);

  useEffect(() => {
    if (!room || trackIdx === 0) { setPrevTracksMap(new Map()); return; }
    const ids = room.trackIds.slice(0, trackIdx);
    void Promise.all(
      ids.map(async (id, i) => {
        const tr = await getTrackById(id);
        return tr ? ([i, tr] as const) : null;
      })
    ).then((entries) => {
      setPrevTracksMap(new Map(entries.filter((e): e is [number, Track] => e !== null)));
    });
  }, [room?.id, trackIdx]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 400),
      window.setTimeout(() => setStage(2), 900),
      window.setTimeout(() => setStage(3), 1350),
      window.setTimeout(() => setStage(4), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Escape if room deleted (host dropped)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!room) navigate("/online", { replace: true });
    }, 8000);
    return () => clearTimeout(timer);
  }, [room, navigate]);

  // Non-hosts: watch for host advancing
  useEffect(() => {
    if (!room) return;
    if (room.status === "ended") {
      navigate(`/online/end/${code}`, { replace: true });
      return;
    }
    if (room.currentTrackIdx > trackIdx) {
      navigate(`/online/game/${code}`, { replace: true });
    }
  }, [room?.status, room?.currentTrackIdx, trackIdx, code, navigate]);

  const totalTracks = room?.trackIds.length ?? 0;
  const isLastTrack = trackIdx >= totalTracks - 1;

  const handleNext = async () => {
    if (!room || !isHost) return;
    haptic("medium");
    await advanceTrack(room.id, totalTracks, trackIdx);
    if (isLastTrack) {
      navigate(`/online/end/${code}`, { replace: true });
    } else {
      navigate(`/online/game/${code}`, { replace: true });
    }
  };

  // Per-player round results, sorted by pts desc
  const roundResults = players
    .map((p) => {
      const g = guesses.find((gx) => gx.playerId === p.playerId);
      if (!g || !p.era || !track) return { player: p, guessYear: null, roundPts: 0, delta: null, correct: false };
      const score = calcScore({ guess: g.guessYear, truth: track.year, playerEra: p.era });
      return {
        player: p,
        guessYear: g.guessYear,
        roundPts: score.points,
        delta: score.delta,
        correct: score.delta <= CORRECT_THRESHOLD_YEARS,
      };
    })
    .sort((a, b) => b.roundPts - a.roundPts);

  const playerTotals = new Map<string, number>();
  for (const r of roundResults) {
    let total = r.roundPts;
    for (let i = 0; i < trackIdx; i++) {
      const prevTrack = prevTracksMap.get(i);
      const g = allGuesses.find((gx) => gx.trackIdx === i && gx.playerId === r.player.playerId);
      if (prevTrack && g && r.player.era) {
        total += calcScore({ guess: g.guessYear, truth: prevTrack.year, playerEra: r.player.era as "klassika" | "kasseta" | "tsifra" }).points;
      }
    }
    playerTotals.set(r.player.playerId, total);
  }

  // Persist for leaderboard strip on next game screen (both host and non-host read this)
  if (room?.id && playerTotals.size > 0) {
    sessionStorage.setItem(`yillar:scores:${room.id}`, JSON.stringify(Object.fromEntries(playerTotals)));
  }

  const myResult = roundResults.find((r) => r.player.playerId === user?.id);
  const isPerfect = myResult?.delta === 0;

  const era = track?.era ?? "klassika";
  const surfaceColor = eraVar(era, "surface");
  const primaryColor = eraVar(era, "primary");
  const deepColor = eraVar(era, "deep");

  // Perfect variant colours (ink-on-gold)
  const bg = isPerfect ? "var(--color-gold)" : primaryColor;
  const fg = isPerfect ? "var(--color-ink)" : surfaceColor;
  const borderColor = isPerfect ? "var(--color-ink)" : surfaceColor;

  if (!track) {
    return (
      <PhoneFrame>
        <div className="flex h-full items-center justify-center">
          <span className={styles.loadingLabel}>{t("online.waitLoading")}</span>
        </div>
      </PhoneFrame>
    );
  }

  const myMultiplier = myPlayer?.era === era ? 3 : 1;
  const myBase = Math.max(0, 10 - (myResult?.delta ?? 0));

  return (
    <PhoneFrame>
      <main
        className={styles.root}
        style={{ background: bg, color: fg }}
      >
        {isPerfect ? null : <PaperGrain opacity={0.4} />}
        <GirihOverlay size={220} opacity={isPerfect ? 0.08 : 0.1} />

        {/* Header */}
        <header className={styles.onlineHeader}>
          <span
            className={styles.eraBadge}
            style={{ color: fg, border: `1px solid ${borderColor}` }}
          >
            {t(`era.${era}` as const)} · {ERA_LABEL[era]}
          </span>
          <h1 className={styles.trackTitle} style={{ color: fg }}>
            {track.title}
          </h1>
          <div className={styles.artistLine}>{track.artist}</div>
        </header>

        {/* Year reveal — Perfect or Standard */}
        <div className={styles.yearSection}>
          {isPerfect ? (
            <div className={styles.perfectYearStage}>
              <div className={styles.perfectBgLayer} aria-hidden>
                <StarShape className={styles.starWatermark} />
                <div className={styles.ring} style={{ animationDelay: "0s" }} />
                <div className={styles.ring} style={{ animationDelay: "0.7s" }} />
                <div className={styles.ring} style={{ animationDelay: "1.4s" }} />
              </div>
              <div className={styles.perfectYear} data-shown={stage >= 1}>
                {track.year}
              </div>
              <div className={styles.flash} data-shown={stage >= 1} aria-hidden />
            </div>
          ) : (
            <div className={styles.yearStage} style={{ background: deepColor }}>
              <div className={styles.yearText} data-shown={stage >= 2} style={{ color: surfaceColor }}>
                {track.year}
              </div>
              <div className={styles.redactCover} data-burned={stage >= 1}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.redactBlockBig} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My stats */}
        {myResult?.guessYear != null && (
          <div className="relative px-5 pb-3 flex-shrink-0">
            {isPerfect ? (
              <>
                {/* Perfect stamp row */}
                <div className={styles.stampRow} data-shown={stage >= 2}>
                  <StarShape className={styles.starInline} />
                  <span className={styles.stampText}>{t("reveal.exactStamp")}</span>
                  <span className={styles.offBy}>{t("reveal.offByZero")}</span>
                </div>
                {/* Math row */}
                <div className={styles.perfectMath} data-shown={stage >= 3}>
                  <span>
                    {t("reveal.base", { n: myBase })}
                    {myMultiplier > 1 && <span> {t("reveal.timesEra", { n: myMultiplier })}</span>}
                    {" "}
                    <span className={styles.bonusToken}>
                      {t("reveal.bonusExact", { n: myResult.roundPts - myBase * myMultiplier })}
                    </span>
                  </span>
                  <span className={styles.perfectPoints}>+{myResult.roundPts}</span>
                </div>
              </>
            ) : (
              <>
                {/* Multiplier row */}
                <div
                  className={styles.multiplierRow}
                  style={{ opacity: stage >= 3 ? 1 : 0, transition: "opacity 200ms linear" }}
                >
                  <div className={styles.multiplierLabel} style={{ color: surfaceColor }}>
                    {t("reveal.eraMultiplier")}
                  </div>
                  <div className={styles.multiplierDrop} data-shown={stage >= 3}>
                    <Multiplier n={myMultiplier} />
                  </div>
                </div>

                {/* Stats grid */}
                <div
                  className={styles.statsGrid}
                  style={{
                    borderTop: `1px solid ${surfaceColor}`,
                    borderBottom: `1px solid ${surfaceColor}`,
                    opacity: stage >= 3 ? 1 : 0,
                    transition: "opacity 200ms linear",
                  }}
                >
                  <StatCell label={t("reveal.youGuessed")} value={String(myResult.guessYear)} color={surfaceColor} />
                  <StatCell
                    label={t("reveal.offBy")}
                    value={`${myResult.delta} ${t("reveal.years")}`}
                    color={surfaceColor}
                    align="center"
                  />
                  <div className={styles.statCellRight}>
                    <span className={styles.statCellLabel} style={{ color: surfaceColor }}>
                      {t("reveal.points")}
                    </span>
                    <span
                      className={styles.pointsValue}
                      data-shown={stage >= 4}
                      style={{ color: surfaceColor }}
                    >
                      +{myResult.roundPts}
                    </span>
                  </div>
                </div>

                {/* Math breakdown */}
                <div
                  className={styles.mathBreakdown}
                  data-shown={stage >= 4}
                  style={{ background: deepColor, color: surfaceColor }}
                >
                  <span>{t("reveal.base", { n: myBase })}</span>
                  <span>{t("reveal.timesEra", { n: myMultiplier })}</span>
                  <span>{t("reveal.equalsPts", { n: myResult.roundPts })}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Players table */}
        <div
          className={styles.tableSection}
          data-shown={isPerfect ? stage >= 3 : stage >= 4}
        >
          <div
            className={styles.tableHeader}
            style={{ color: fg }}
          >
            <span className={styles.tableHeaderCell} style={{ color: fg }}>
              {t("online.revealTitle", { n: trackIdx + 1, m: totalTracks })}
            </span>
            <span className={styles.tableHeaderCell} style={{ color: fg }}>{t("online.revealDelta")}</span>
            <span className={styles.tableHeaderCell} style={{ color: fg }}>{t("online.revealRoundPts")}</span>
            <span className={styles.tableHeaderCell} style={{ color: fg }}>{t("online.revealTotal")}</span>
          </div>

          {roundResults.map(({ player, guessYear, roundPts, delta }) => {
            const isMe = player.playerId === user?.id;
            return (
              <div key={player.id} className={styles.tableRow} data-me={isMe} style={{ color: fg }}>
                <div className={styles.playerName} style={{ color: fg }}>
                  {player.name}
                  {isMe && (
                    <span
                      className={styles.youBadge}
                      style={isPerfect
                        ? { background: "var(--color-ink)", color: "var(--color-gold)" }
                        : { background: surfaceColor, color: primaryColor }
                      }
                    >
                      {t("online.revealYou")}
                    </span>
                  )}
                </div>

                {guessYear != null ? (
                  <>
                    <span className={`${styles.cell} ${styles.cellMuted}`} style={{ color: fg }}>
                      {delta === 0 ? "★" : `±${delta}`}
                    </span>
                    <span
                      className={`${styles.cell} ${roundPts > 0 ? styles.cellAccent : styles.cellMuted}`}
                      style={{ color: fg }}
                    >
                      +{roundPts}
                    </span>
                    <span className={`${styles.cell} ${styles.cellAccent}`} style={{ color: fg }}>
                      {playerTotals.get(player.playerId) ?? 0}
                    </span>
                  </>
                ) : (
                  <span
                    className={`${styles.waitingCell} ${styles.cellMuted} ${styles.waitingPulse}`}
                    style={{ color: fg }}
                  >
                    {t("online.waitWaiting")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer
          className={styles.footer}
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          {isHost ? (
            isPerfect ? (
              <button
                className={styles.perfectNextBtn}
                onClick={handleNext}
              >
                {isLastTrack ? t("online.revealFinish") : t("online.revealNext")}
              </button>
            ) : (
              <YButton variant="era" era={era} onClick={handleNext}>
                {isLastTrack ? t("online.revealFinish") : t("online.revealNext")}
              </YButton>
            )
          ) : (
            <div
              className={`${styles.nonHostWaiting} ${styles.waitingPulse}`}
              style={{ color: fg }}
            >
              {t("online.revealWaitHost")}
            </div>
          )}
        </footer>
      </main>
    </PhoneFrame>
  );
}

function StatCell({
  label,
  value,
  color,
  align = "left",
}: {
  label: string;
  value: string;
  color: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <div className={styles.statCell} style={{ textAlign: align }}>
      <span className={styles.statCellLabel} style={{ color }}>{label}</span>
      <span className={styles.statCellValue} style={{ color }}>{value}</span>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CatalogLine, GirihOverlay, PhoneFrame, YButton } from "@shared/ui";
import { ERAS, eraVar, useT, shareResult } from "@shared/lib";
import { useGameStore, useActivePlayers } from "@entities/game";
import { useSessionStore } from "@entities/session";
import { useSaveGame } from "@features/save-game";
import { useProfileStats } from "@entities/game-history";
import StarMark from "@shared/assets/svg/star-mark.svg?react";
import styles from "./EndPage.module.css";

export function EndPage() {
  const navigate = useNavigate();
  const t = useT();
  const activePlayers = useActivePlayers();
  const placements = useGameStore((s) => s.placements);
  const scores = useGameStore((s) => s.scores);
  const totalCards = useGameStore((s) => s.totalCards);
  const reset = useGameStore((s) => s.reset);
  const savedGameId = useGameStore((s) => s.savedGameId);
  const beginSave = useGameStore((s) => s.beginSave);
  const markGameSaved = useGameStore((s) => s.markGameSaved);
  const resetSaveFlag = useGameStore((s) => s.resetSaveFlag);
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const { mutate: persist } = useSaveGame();

  const hostPlayerId = activePlayers[0]?.id ?? null;
  const stats = useProfileStats(user?.id);
  const [shareLabel, setShareLabel] = useState<string | null>(null);

  const ranked = useMemo(
    () =>
      activePlayers
        .map((p) => ({ ...p, total: scores[p.id] ?? 0, placements: placements[p.id] ?? [] }))
        .sort((a, b) => b.total - a.total),
    [activePlayers, scores, placements],
  );

  const winner = ranked[0];
  const isNewRecord =
    winner?.id === hostPlayerId &&
    stats.data?.bestScore != null &&
    winner.total > stats.data.bestScore;

  const PARTICLES = [
    { left: "12%", top: "60%", dur: "1.8s", delay: "0s" },
    { left: "28%", top: "75%", dur: "2.2s", delay: "0.15s" },
    { left: "50%", top: "55%", dur: "1.9s", delay: "0.3s" },
    { left: "68%", top: "70%", dur: "2.1s", delay: "0.1s" },
    { left: "82%", top: "62%", dur: "2.0s", delay: "0.25s" },
    { left: "38%", top: "80%", dur: "1.7s", delay: "0.4s" },
  ];

  function handleShare() {
    const lines = [
      "YILLAR",
      ...ranked.map((p, i) =>
        `${i === 0 ? "★" : `${i + 1}.`} ${p.name} — ${p.total} ${t("end.points")}`
      ),
      `${totalCards} ${t("share.cards")}`,
    ];
    shareResult(lines.join("\n")).then((outcome) => {
      if (outcome === "copied") {
        setShareLabel(t("share.copied"));
        setTimeout(() => setShareLabel(null), 2000);
      }
    });
  }

  useEffect(() => {
    if (savedGameId) return;
    if (!user || !winner || !hostPlayerId) return;
    if (!beginSave()) return;
    const hostName = profile?.displayName?.toUpperCase() || activePlayers[0]?.name || "HOST";
    persist(
      {
        hostId: user.id,
        totalCards,
        players: ranked.map((p, i) => {
          const isHost = p.id === hostPlayerId;
          return {
            displayName: isHost ? hostName : p.name,
            generation: p.era,
            totalScore: p.total,
            rank: i + 1,
            isWinner: i === 0,
            isHost,
            placements: p.placements,
          };
        }),
      },
      {
        onSuccess: (gameId) => markGameSaved(gameId),
        onError: () => resetSaveFlag(),
      },
    );
  }, [savedGameId, user, winner, ranked, persist, totalCards, profile?.displayName, hostPlayerId, activePlayers, beginSave, markGameSaved, resetSaveFlag]);

  if (!winner) {
    return (
      <PhoneFrame>
        <main className={styles.emptyMain}>
          <YButton onClick={() => navigate("/")}>{t("end.back")}</YButton>
        </main>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <main className={styles.pageMain}>
        <GirihOverlay size={200} opacity={0.05} />

        <header className={styles.header}>
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{ left: p.left, top: p.top, ["--dur" as string]: p.dur, ["--delay" as string]: p.delay }}
            />
          ))}
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
            <span className={styles.winnerPoints}>{winner.total} {t("end.points")}</span>
            <span className={styles.winnerGen}>
              {t("end.gen")} {winner.era ? t(`era.${winner.era}` as const) : "—"}
            </span>
          </div>
        </header>

        <div className={styles.body}>
          <CatalogLine
            left={t("end.perPlayer")}
            right={t("end.playersCount", { n: ranked.length })}
            style={{ marginBottom: 10 }}
          />

          <ol>
          {ranked.map((p, i) => {
            const eraStats = ERAS.map((era) => {
              const ofEra = p.placements.filter((pl) => pl.era === era);
              return { era, correct: ofEra.filter((pl) => pl.correct).length, total: ofEra.length };
            });

            return (
              <li key={p.id} className={styles.playerCard} data-winner={i === 0}>
                <div className={styles.playerCardTop}>
                  <div className={styles.playerCardLeft}>
                    <span className={styles.placeBadge}>#{t("end.placeBadge", { n: i + 1 })}</span>
                    <div className={styles.nameRow}>
                      <span className={styles.playerName} style={{ opacity: i === 0 ? 1 : 0.85 }}>
                        {p.name}
                      </span>
                      {i === 0 && <StarMark className={styles.starMark} aria-hidden />}
                    </div>
                  </div>
                  <span
                    className={styles.playerScore}
                    style={{ color: i === 0 ? "var(--color-gold)" : "var(--color-cream)" }}
                  >
                    {p.total}
                  </span>
                </div>

                <div className={styles.eraGrid}>
                  {eraStats.map(({ era, correct, total }) => (
                    <div key={era}>
                      <div className={`${styles.eraLabelRow} ${styles.eraLabel}`}>
                        <span style={{ color: eraVar(era, "primary") }}>{t(`era.short.${era}` as const)}</span>
                        <span className="opacity-60">{correct}/{total || 0}</span>
                      </div>
                      <div className={styles.eraBar}>
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

                {p.era && (
                  <div className={styles.bonusGen}>
                    {t("end.bonusGen", { era: t(`era.${p.era}` as const) })}
                  </div>
                )}
              </li>
            );
          })}
          </ol>
        </div>

        <footer className={styles.footer}>
          <YButton variant="ghost" style={{ width: 110, flexShrink: 0 }} onClick={handleShare}>{shareLabel ?? t("end.share")}</YButton>
          <YButton onClick={() => { reset(); navigate("/", { replace: true }); }}>{t("end.replay")}</YButton>
        </footer>
      </main>
    </PhoneFrame>
  );
}

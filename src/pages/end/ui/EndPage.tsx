import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CatalogLine, GirihOverlay, PhoneFrame, YButton } from "@shared/ui";
import { ERAS, eraVar, useT, type TranslationKey } from "@shared/lib";
import { useGameStore, useActivePlayers } from "@entities/game";
import { useSessionStore } from "@entities/session";
import { useSaveGame } from "@features/save-game";
import starMark from "@shared/assets/svg/star-mark.svg";
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
  const { mutate: persist, status: saveStatus } = useSaveGame();

  const hostPlayerId = activePlayers[0]?.id ?? null;

  const ranked = useMemo(
    () =>
      activePlayers
        .map((p) => ({
          ...p,
          total: scores[p.id] ?? 0,
          placements: placements[p.id] ?? [],
        }))
        .sort((a, b) => b.total - a.total),
    [activePlayers, scores, placements],
  );

  const winner = ranked[0];

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

  const onReplay = () => {
    reset();
    navigate("/", { replace: true });
  };

  if (!winner) {
    return (
      <PhoneFrame>
        <div className="flex flex-1 items-center justify-center p-6">
          <YButton onClick={() => navigate("/")}>{t("end.back")}</YButton>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col overflow-hidden bg-ink text-cream">
        <GirihOverlay size={200} opacity={0.05} />

        <div className="relative border-b border-gold px-[18px] py-[14px]">
          <CatalogLine
            left={t("end.headerFinal", { placed: winner.placements.length, total: totalCards })}
            right={saveLabel(t, saveStatus, !!user, !!savedGameId)}
          />
        </div>

        <div className="relative border-b border-gold px-5 pt-[18px] pb-[14px]">
          <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-gold">{t("end.winner")}</div>
          <div
            className="mt-1 truncate font-display font-black leading-[0.92] text-cream"
            style={{
              fontSize: winner.name.length <= 6 ? 64 : winner.name.length <= 9 ? 50 : 38,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {winner.name}
          </div>
          <div className="mt-[6px] flex items-baseline justify-between font-mono text-[11px] tracking-[0.14em] text-gold">
            <span className="text-[16px] font-medium text-cream">{winner.total} {t("end.points")}</span>
            <span className="opacity-60">
              {t("end.gen")} {winner.era ? t(`era.${winner.era}` as const) : "—"}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-2 pt-[14px]">
          <CatalogLine
            left={t("end.perPlayer")}
            right={t("end.playersCount", { n: ranked.length })}
            style={{ marginBottom: 10 }}
          />

          {ranked.map((p, i) => {
            const eraStats = ERAS.map((era) => {
              const ofEra = p.placements.filter((pl) => pl.era === era);
              return {
                era,
                correct: ofEra.filter((pl) => pl.correct).length,
                total: ofEra.length,
              };
            });

            return (
              <div key={p.id} className={styles.playerCard} data-winner={i === 0}>
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold whitespace-nowrap">
                      # {t("end.placeBadge", { n: i + 1 })}
                    </span>
                    <span
                      className="font-condensed text-[20px] font-extrabold uppercase tracking-[0.08em] text-cream"
                      style={{ opacity: i === 0 ? 1 : 0.85 }}
                    >
                      {p.name}
                    </span>
                    {i === 0 && <img src={starMark} alt="" className={styles.starMark} />}
                  </div>
                  <span
                    className="font-display text-[26px] font-black leading-none"
                    style={{ letterSpacing: "-0.02em", color: i === 0 ? "var(--color-gold)" : "var(--color-cream)" }}
                  >
                    {p.total}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {eraStats.map(({ era, correct, total }) => (
                    <div key={era}>
                      <div className="mb-[2px] flex justify-between font-mono text-[8px] uppercase tracking-[0.18em]">
                        <span style={{ color: eraVar(era, "primary") }}>{t(`era.short.${era}` as const)}</span>
                        <span className="opacity-60">
                          {correct}/{total || 0}
                        </span>
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

                {p.era && (
                  <div className="mt-[6px] font-mono text-[8px] uppercase tracking-[0.2em] text-gold opacity-70">
                    {t("end.bonusGen", { era: t(`era.${p.era}` as const) })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex h-6">
          <div className="flex-1 bg-klassika-primary" />
          <div className="flex-1 bg-kasseta-primary" />
          <div className="flex-1 bg-tsifra-primary" />
        </div>

        <div className="flex gap-2 border-t border-gold bg-ink p-3">
          <YButton variant="ghost" style={{ width: 110, flexShrink: 0 }}>
            {t("end.share")}
          </YButton>
          <YButton onClick={onReplay}>{t("end.replay")}</YButton>
        </div>
      </div>
    </PhoneFrame>
  );
}

function saveLabel(
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
  status: "idle" | "pending" | "success" | "error",
  hasUser: boolean,
  done: boolean,
): string {
  if (!hasUser) return t("end.notSaved");
  if (done) return t("end.saved");
  switch (status) {
    case "pending":
      return t("end.saving");
    case "error":
      return t("end.saveFailed");
    default:
      return t("end.preparing");
  }
}

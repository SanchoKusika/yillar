import { CatalogLine } from "@shared/ui";
import { ERA_LABEL, useT } from "@shared/lib";
import type { EraBreakdownEntry } from "@entities/game-history";
import styles from "./StatsTab.module.css";

type StatsTabProps = {
  eraBreakdown: EraBreakdownEntry[] | undefined;
  bestDecade: { decade: number; correct: number; total: number; accuracy: number } | null | undefined;
  wins: number | undefined;
  loading: boolean;
};

export function StatsTab({ eraBreakdown, bestDecade, wins, loading }: StatsTabProps) {
  const t = useT();

  if (loading) {
    return <div className={styles.loading}>{t("profile.loading")}</div>;
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
              <div className={styles.eraRow}>
                <span style={{ color: `var(--color-${r.era}-primary)` }}>{ERA_LABEL[r.era]}</span>
                <span className="opacity-70 tabular-nums">
                  {r.correct} / {r.total} {t("profile.tracksWord")} · {Math.round(pct)}%
                </span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className="transition-[width] duration-500"
                  style={{ width: `${pct}%`, background: `var(--color-${r.era}-primary)` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <article className={styles.statCard}>
        <div className={styles.cardLabel}>{t("profile.bestDecade")}</div>
        {bestDecade ? (
          <>
            <div className={styles.cardBigNum}>
              {t("profile.decadeFormat", { n: bestDecade.decade })}
            </div>
            <div className={styles.cardSub}>
              {bestDecade.correct}/{bestDecade.total} {t("profile.songsWord")} · {Math.round(bestDecade.accuracy * 100)}%
            </div>
          </>
        ) : (
          <div className={styles.cardEmpty}>{t("profile.bestDecade.empty")}</div>
        )}
      </article>

      <article className={styles.statCard}>
        <div className={styles.cardLabel}>{t("profile.wins")}</div>
        <div className={styles.cardBigNum}>{wins ?? "—"}</div>
      </article>
    </div>
  );
}

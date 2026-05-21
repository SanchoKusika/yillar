import { CatalogLine } from "@shared/ui";
import { useT } from "@shared/lib";
import { formatDate } from "../formatDate";
import styles from "./HistoryTab.module.css";

type HistoryEntry = {
  id: string;
  startedAt: string;
  totalCards: number;
  hostScore: number;
  hostRank: number | null;
  isWinner: boolean;
  playerCount: number;
};

type HistoryTabProps = {
  entries: HistoryEntry[] | undefined;
  loading: boolean;
};

export function HistoryTab({ entries, loading }: HistoryTabProps) {
  const t = useT();

  return (
    <div>
      <CatalogLine
        left={t("profile.lastSessions")}
        right={`${entries?.length ?? 0}`}
        style={{ marginBottom: 10 }}
      />
      {loading ? (
        <div className={styles.loading}>{t("profile.loading")}</div>
      ) : entries && entries.length > 0 ? (
        <ul className="flex flex-col gap-[6px]">
          {entries.map((g) => (
            <li
              key={g.id}
              className={styles.row}
              style={{ borderLeft: `3px solid ${g.isWinner ? "var(--color-gold)" : "var(--color-ink-3)"}` }}
            >
              <div className="flex flex-col gap-[2px]">
                <span className={styles.rowMeta}>
                  <time dateTime={g.startedAt}>{formatDate(g.startedAt)}</time> · {g.playerCount} {t("profile.players")}
                </span>
                <span className={styles.rowRank}>
                  {g.isWinner
                    ? t("profile.winnerStar")
                    : g.hostRank
                      ? `# ${t("profile.placeBadge", { n: g.hostRank })}`
                      : "—"}
                </span>
              </div>
              <div
                className={styles.rowScore}
                style={{ color: g.isWinner ? "var(--color-gold)" : "var(--color-cream)" }}
              >
                {g.hostScore}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>{t("profile.history.empty")}</div>
      )}
    </div>
  );
}

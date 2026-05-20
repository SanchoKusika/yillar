import { useT } from "@shared/lib";
import styles from "./ScoreboardBar.module.css";

type ScoreEntry = { id: string; name: string; score: number; turn: boolean };

type ScoreboardBarProps = {
  currentName: string;
  cardIdx: number;
  totalCards: number;
  entries: ScoreEntry[];
};

export function ScoreboardBar({ currentName, cardIdx, totalCards, entries }: ScoreboardBarProps) {
  const t = useT();
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className="flex items-center gap-2">
          <span className={styles.turnLabel}>{t("game.turn")}</span>
          <span className={styles.turnName}>{currentName}</span>
        </div>
        <span className={styles.cardCount}>
          {t("game.cardOf", {
            idx: String(cardIdx + 1).padStart(2, "0"),
            total: String(totalCards).padStart(2, "0"),
          })}
        </span>
      </div>
      <ul className={styles.cells}>
        {entries.map((p, i) => (
          <li
            key={p.id}
            className={styles.scoreCell}
            data-turn={p.turn}
            style={i < entries.length - 1 ? { borderRight: "1px solid var(--color-ink-3)" } : undefined}
          >
            {p.turn && <div className={styles.activeLine} />}
            <div className={styles.scoreName} data-turn={p.turn}>{p.name}</div>
            <div className={styles.scoreVal} data-turn={p.turn}>
              {String(p.score).padStart(3, "0")}
            </div>
          </li>
        ))}
      </ul>
    </header>
  );
}

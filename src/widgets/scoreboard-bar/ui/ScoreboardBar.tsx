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
    <div className="border-b border-gold bg-ink px-[14px] py-[10px]">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.2em] text-gold">{t("game.turn")}</span>
          <span className="font-condensed text-[17px] font-extrabold uppercase tracking-[0.12em] text-cream">
            {currentName}
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-[0.2em] text-gold">
          {t("game.cardOf", {
            idx: String(cardIdx + 1).padStart(2, "0"),
            total: String(totalCards).padStart(2, "0"),
          })}
        </span>
      </div>
      <div className="flex border-t border-ink-3">
        {entries.map((p, i) => (
          <div
            key={p.id}
            className={styles.scoreCell}
            data-turn={p.turn}
            style={i < entries.length - 1 ? { borderRight: "1px solid var(--color-ink-3)" } : undefined}
          >
            {p.turn && <div className="absolute inset-x-0 top-0 h-[2px] bg-gold" />}
            <div className={styles.scoreName} data-turn={p.turn}>{p.name}</div>
            <div className={styles.scoreVal} data-turn={p.turn}>
              {String(p.score).padStart(3, "0")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

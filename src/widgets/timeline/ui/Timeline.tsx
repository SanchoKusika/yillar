import { CatalogLine } from "@shared/ui";
import { eraVar, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import styles from "./Timeline.module.css";

const DECADE_SCALE = [1960, 1970, 1980, 1990, 2000, 2010, 2020];

type TimelineProps = {
  playerName: string;
  placements: Placement[];
  guessYear: number;
  onGuessChange: (y: number) => void;
};

export function Timeline({ playerName, placements, guessYear, onGuessChange }: TimelineProps) {
  const t = useT();
  return (
    <div className={styles.root}>
      <CatalogLine
        left={t("timeline.title", { name: playerName })}
        right={t("timeline.placed", { n: placements.length })}
        style={{ marginBottom: 10 }}
      />

      <ul className={styles.placements}>
        {placements.map((p, i) => (
          <li
            key={i}
            className={styles.placementCard}
            style={{
              background: eraVar(p.era, "surface"),
              borderLeft: `3px solid ${p.correct ? eraVar(p.era, "primary") : "var(--color-danger)"}`,
            }}
          >
            <div className={styles.placementEra} style={{ color: eraVar(p.era, "primary") }}>
              {t(`era.short.${p.era}` as const)}
            </div>
            <div className={styles.placementYear} style={{ color: eraVar(p.era, "primary") }}>
              {p.truth}
            </div>
            <div
              className={styles.placementTitle}
              style={{ borderTop: `1px solid ${eraVar(p.era, "primary")}`, color: eraVar(p.era, "primary") }}
            >
              {p.title}
            </div>
            {!p.correct && <div className={styles.placementDelta}>−{p.delta}Y</div>}
          </li>
        ))}

        <li className={styles.dropZone}>
          <div className={styles.dropHint}>
            {t("timeline.drop")}<br />{t("timeline.here")}
          </div>
          <div className={styles.dropYear}>{guessYear}</div>
          <div className={styles.dropIdx}>{String(placements.length + 1).padStart(2, "0")}</div>
        </li>
      </ul>

      <div className="mt-2">
        <input
          type="range"
          min={1960}
          max={2025}
          value={guessYear}
          onChange={(e) => onGuessChange(parseInt(e.target.value, 10))}
          className={styles.yearSlider}
        />
      </div>

      <div className={styles.decadeRuler}>
        <div className={styles.decadeRulerLine} />
        {DECADE_SCALE.map((y, i, arr) => (
          <div
            key={y}
            className={styles.decadeLabel}
            style={{ left: `${(i / (arr.length - 1)) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className={styles.decadeTick} />
            '{String(y).slice(2)}
          </div>
        ))}
      </div>
    </div>
  );
}

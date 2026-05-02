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
    <div className="relative flex flex-1 flex-col justify-end px-[14px] pt-[14px] pb-[6px]">
      <CatalogLine
        left={t("timeline.title", { name: playerName })}
        right={t("timeline.placed", { n: placements.length })}
        style={{ marginBottom: 10 }}
      />

      <div className="relative flex items-stretch gap-[6px] overflow-x-auto">
        {placements.map((p, i) => (
          <div
            key={i}
            className="relative flex h-[86px] w-[72px] shrink-0 flex-col justify-between p-[6px] pl-2 text-ink"
            style={{
              background: eraVar(p.era, "surface"),
              borderLeft: `3px solid ${p.correct ? eraVar(p.era, "primary") : "var(--color-danger)"}`,
            }}
          >
            <div
              className="font-mono text-[7px] uppercase tracking-[0.2em]"
              style={{ color: eraVar(p.era, "primary") }}
            >
              {t(`era.short.${p.era}` as const)}
            </div>
            <div
              className="font-display text-[24px] font-black leading-[0.95]"
              style={{ letterSpacing: "-0.02em", color: eraVar(p.era, "primary") }}
            >
              {p.truth}
            </div>
            <div
              className="pt-[2px] font-condensed text-[8px] font-bold uppercase tracking-[0.14em]"
              style={{ borderTop: `1px solid ${eraVar(p.era, "primary")}` }}
            >
              {p.title}
            </div>
            {!p.correct && (
              <div className="absolute right-1 top-1 font-mono text-[8px] uppercase tracking-[0.1em] text-danger">
                −{p.delta}Y
              </div>
            )}
          </div>
        ))}

        <div className={styles.dropZone}>
          <div className="text-center font-mono text-[7px] uppercase tracking-[0.22em] text-gold">
            {t("timeline.drop")}
            <br />
            {t("timeline.here")}
          </div>
          <div
            className="font-display text-[22px] font-black leading-none text-gold"
            style={{ letterSpacing: "-0.02em" }}
          >
            {guessYear}
          </div>
          <div className="absolute left-1 top-1 font-mono text-[7px] uppercase tracking-[0.18em] text-gold opacity-60">
            {String(placements.length + 1).padStart(2, "0")}
          </div>
        </div>
      </div>

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

      <div className="relative mt-2 h-4">
        <div className="absolute left-0 right-0 top-[5px] h-px bg-gold opacity-40" />
        {DECADE_SCALE.map((y, i, arr) => (
          <div
            key={y}
            className="absolute top-0 font-mono text-[8px] tracking-[0.08em] text-gold opacity-70"
            style={{ left: `${(i / (arr.length - 1)) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="mx-auto mb-px h-1 w-px bg-gold" />
            '{String(y).slice(2)}
          </div>
        ))}
      </div>
    </div>
  );
}

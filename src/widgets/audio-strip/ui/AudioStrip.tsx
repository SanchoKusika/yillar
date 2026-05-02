import { useT } from "@shared/lib";
import styles from "./AudioStrip.module.css";

type AudioStripProps = {
  playing: boolean;
  progress?: number;
  timeLabel?: string;
  onToggle: () => void;
};

const BAR_COUNT = 10;
const BAR_DURATIONS = [0.62, 0.94, 0.48, 1.12, 0.78, 0.56, 1.02, 0.7, 0.86, 0.52];
const BAR_DELAYS = [-0.22, -0.41, -0.07, -0.65, -0.18, -0.83, -0.31, -0.55, -0.12, -0.74];

export function AudioStrip({
  playing,
  progress = 0.34,
  timeLabel = "00:58 / 02:58",
  onToggle,
}: AudioStripProps) {
  const t = useT();
  return (
    <div className="relative mx-[14px] mt-3 border border-ink-3 bg-ink-2 px-3 pb-3 pt-[10px]">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-[6px] font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
          <span className={styles.redLed} data-on={playing} />
          {t("audio.muted")}
        </div>
        <span className="font-mono text-[10px] tabular-nums text-cream opacity-80">{timeLabel}</span>
      </div>

      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-gold text-ink"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14">
              <rect x="2" y="1" width="3.5" height="12" fill="currentColor" />
              <rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14">
              <polygon points="2,1 12,7 2,13" fill="currentColor" />
            </svg>
          )}
        </button>

        <div className="relative h-[14px] flex-1">
          <div className="absolute left-0 right-0 top-[6px] h-[2px] bg-ink-3" />
          <div className="absolute left-0 top-[6px] h-[2px] bg-gold" style={{ width: `${progress * 100}%` }} />
          {[0.25, 0.5, 0.75].map((t) => (
            <div
              key={t}
              className="absolute top-[2px] h-[10px] w-px bg-gold opacity-35"
              style={{ left: `${t * 100}%` }}
            />
          ))}
          <div
            className="absolute top-[2px] h-[10px] w-[2px] bg-gold"
            style={{
              left: `${progress * 100}%`,
              transform: "translateX(-50%)",
              boxShadow: "0 0 0 2px var(--color-ink-2)",
            }}
          />
        </div>

        <div className={styles.waveStack} data-playing={playing} aria-hidden>
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <div
              key={i}
              className={styles.waveBar}
              data-variant={i % 4}
              data-playing={playing}
              style={{
                animationDuration: `${BAR_DURATIONS[i]}s`,
                animationDelay: `${BAR_DELAYS[i]}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

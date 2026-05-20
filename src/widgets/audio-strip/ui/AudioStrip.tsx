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
    <div className={styles.strip}>
      <div className={styles.topRow}>
        <div className={styles.label}>
          <span className={styles.redLed} data-on={playing} />
          {t("audio.muted")}
        </div>
        <span className={styles.timeLabel}>{timeLabel}</span>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={onToggle}
          className={styles.playBtn}
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

        <div className={styles.progressWrap}>
          <div className={styles.progressTrack} />
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
          {[0.25, 0.5, 0.75].map((t) => (
            <div
              key={t}
              className={styles.progressTick}
              style={{ left: `${t * 100}%` }}
            />
          ))}
          <div
            className={styles.progressThumb}
            style={{ left: `${progress * 100}%` }}
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

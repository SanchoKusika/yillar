import { useEffect, useState } from "react";
import { GirihOverlay, PaperGrain } from "@shared/ui";
import { ERA_LABEL, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import type { Player } from "@entities/player";
import styles from "./RevealPerfect.module.css";

const STAR_POINTS =
  "0,-30 6,-13 23,-17 12,-4 30,0 12,4 23,17 6,13 0,30 -6,13 -23,17 -12,4 -30,0 -12,-4 -23,-17 -6,-13";

function StarShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <g transform="translate(32 32)">
        <polygon fill="currentColor" points={STAR_POINTS} />
      </g>
    </svg>
  );
}

type Props = {
  last: Placement;
  nextPlayer: Player;
  onNext: () => void;
};

export function RevealPerfect({ last, nextPlayer, onNext }: Props) {
  const t = useT();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 220),
      window.setTimeout(() => setStage(2), 700),
      window.setTimeout(() => setStage(3), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const eraMatch = last.multiplier > 1;
  const baseTimes = eraMatch
    ? `${t("reveal.base", { n: last.base })} ${t("reveal.timesEra", { n: last.multiplier })}`
    : t("reveal.base", { n: last.base });

  return (
    <div className={styles.root}>
      <PaperGrain opacity={0.4} />
      <GirihOverlay size={240} opacity={0.12} />

      <div className={styles.meta}>
        <span className={styles.eraTag}>
          {t(`era.${last.era}` as const)} · {ERA_LABEL[last.era]}
        </span>
        <h1 className={styles.title}>{last.title}</h1>
        <div className={styles.subtitle}>{last.artist}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.yearStage}>
          <div className={styles.bgLayer} aria-hidden>
            <StarShape className={styles.starWatermark} />
            <div className={styles.ring} style={{ animationDelay: "0s" }} />
            <div className={styles.ring} style={{ animationDelay: "0.7s" }} />
            <div className={styles.ring} style={{ animationDelay: "1.4s" }} />
          </div>
          <div className={styles.year} data-shown={stage >= 1}>
            {last.truth}
          </div>
          <div className={styles.flash} data-shown={stage >= 1} aria-hidden />
        </div>

        <div className={styles.stampRow} data-shown={stage >= 2}>
          <StarShape className={styles.starInline} />
          <span className={styles.stampText}>{t("reveal.exactStamp")}</span>
          <span className={styles.offBy}>{t("reveal.offByZero")}</span>
        </div>

        <div className={styles.math} data-shown={stage >= 3}>
          <span>
            {baseTimes} <span className={styles.bonusToken}>{t("reveal.bonusExact", { n: last.bonus })}</span>
          </span>
          <span className={styles.points}>+{last.points}</span>
        </div>
      </div>

      <div className={styles.footer} data-shown={stage >= 3}>
        <button className={styles.nextBtn} onClick={onNext}>
          {t("reveal.nextCard", { name: nextPlayer.name })}
        </button>
      </div>
    </div>
  );
}

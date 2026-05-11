import { useEffect, useState } from "react";
import { GirihOverlay, PaperGrain, YButton } from "@shared/ui";
import { ERA_LABEL, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import type { Player } from "@entities/player";
import styles from "./RevealRejected.module.css";

type Props = {
  last: Placement;
  player: Player;
  cardIdx: number;
  totalCards: number;
  nextPlayer: Player;
  onNext: () => void;
};

export function RevealRejected({ last, player, cardIdx, totalCards, nextPlayer, onNext }: Props) {
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

  return (
    <div className={styles.root}>
      <PaperGrain opacity={0.35} />
      <GirihOverlay size={220} opacity={0.06} />

      <div className={styles.meta}>
        <span className={styles.eraTag}>
          {t(`era.${last.era}` as const)} · {ERA_LABEL[last.era]}
        </span>
        <h1 className={styles.title}>{last.title}</h1>
        <div className={styles.subtitle}>{t("reveal.trackNo", { id: last.trackId })}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.stamp} data-shown={stage >= 1}>
          <div className={styles.hatchBg} aria-hidden />
          <div className={styles.stampText}>{t("reveal.rejectedStamp")}</div>
          <div className={styles.stampSub}>{t("reveal.rejectedSub")}</div>
        </div>

        <div className={styles.recordRow} data-shown={stage >= 2}>
          <span className={styles.recordLabel}>{t("reveal.forRecord")}</span>
          <span className={styles.recordYear}>{last.truth}</span>
        </div>

        <div className={styles.pointsRow} data-shown={stage >= 3}>
          <span>{t("reveal.pointsAwarded")}</span>
          <span className={styles.pointsValue}>+0</span>
        </div>
      </div>

      <div className={styles.footer}>
        <YButton onClick={onNext}>{t("reveal.nextCard", { name: nextPlayer.name })}</YButton>
      </div>
    </div>
  );
}

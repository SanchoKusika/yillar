import { useEffect, useState } from "react";
import { GirihOverlay, Multiplier, PaperGrain, YButton } from "@shared/ui";
import { ERA_LABEL, eraVar, useT } from "@shared/lib";
import type { Placement } from "@entities/placement";
import type { Player } from "@entities/player";
import styles from "./RevealPage.module.css";

type Stage = 0 | 1 | 2 | 3 | 4;

type Props = {
  last: Placement;
  nextPlayer: Player;
  onNext: () => void;
};

export function RevealStandard({ last, nextPlayer, onNext }: Props) {
  const t = useT();
  const era = last.era;
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 400),
      window.setTimeout(() => setStage(2), 900),
      window.setTimeout(() => setStage(3), 1350),
      window.setTimeout(() => setStage(4), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main
      className={styles.root}
      style={{ background: eraVar(era, "primary"), color: eraVar(era, "surface") }}
    >
      <PaperGrain opacity={0.4} />
      <GirihOverlay size={220} opacity={0.1} />

      <header className={styles.header}>
        <span
          className={styles.eraBadge}
          style={{ color: eraVar(era, "surface"), border: `1px solid ${eraVar(era, "surface")}` }}
        >
          {t(`era.${era}` as const)} · {ERA_LABEL[era]}
        </span>
        <h1 className={styles.trackTitle}>{last.title}</h1>
        <div className={styles.trackSub}>{last.artist}</div>
      </header>

      <div className={styles.body}>
        <div className={styles.yearStage} style={{ background: eraVar(era, "primary") }}>
          <div
            className={styles.yearText}
            data-shown={stage >= 2}
            style={{ color: eraVar(era, "surface") }}
          >
            {last.truth}
          </div>
          <div className={styles.redactCover} data-burned={stage >= 1}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.redactBlockBig} />
            ))}
          </div>
        </div>

        <div className={styles.multiplierRow}>
          <div className={styles.multiplierLabel}>{t("reveal.eraMultiplier")}</div>
          <div className={styles.multiplierDrop} data-shown={stage >= 3}>
            <Multiplier n={last.multiplier} />
          </div>
        </div>

        <div
          className={styles.statsGrid}
          style={{
            borderTop: `1px solid ${eraVar(era, "surface")}`,
            borderBottom: `1px solid ${eraVar(era, "surface")}`,
          }}
        >
          <Stat label={t("reveal.youGuessed")} value={String(last.guess)} />
          <Stat label={t("reveal.offBy")} value={`${last.delta} ${t("reveal.years")}`} align="center" />
          <div className={styles.statCellRight}>
            <span className={styles.statLabel}>{t("reveal.points")}</span>
            <span
              className={styles.pointsValue}
              data-shown={stage >= 4}
              style={{ color: eraVar(era, "surface") }}
            >
              +{last.points}
            </span>
          </div>
        </div>

        <div
          className={styles.mathBreakdown}
          data-shown={stage >= 4}
          style={{ background: eraVar(era, "deep"), color: eraVar(era, "surface") }}
        >
          <span>{t("reveal.base", { n: last.base })}</span>
          <span>{t("reveal.timesEra", { n: last.multiplier })}</span>
          <span>{t("reveal.equalsPts", { n: last.points })}</span>
        </div>
      </div>

      <footer className={styles.footer} data-shown={stage >= 4} style={{ borderColor: eraVar(era, "surface") }}>
        <YButton variant="era" era={era} onClick={onNext}>
          {t("reveal.nextCard", { name: nextPlayer.name })}
        </YButton>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <div className={styles.statCell} style={{ textAlign: align }}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

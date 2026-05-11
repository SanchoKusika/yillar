import { ERAS, ERA_LABEL, useT, type Era } from "@shared/lib";
import styles from "./EraSelect.module.css";

type EraSelectProps = {
  value: Era | null;
  onChange: (era: Era) => void;
};

export function EraSelect({ value, onChange }: EraSelectProps) {
  const t = useT();
  return (
    <div className={styles.grid}>
      {ERAS.map((era) => (
        <button
          key={era}
          type="button"
          onClick={() => onChange(era)}
          className={styles.btn}
          data-era={era}
          data-active={value === era}
        >
          <div className={styles.sublabel}>{ERA_LABEL[era]}</div>
          <div>{t(`era.${era}` as const)}</div>
        </button>
      ))}
    </div>
  );
}

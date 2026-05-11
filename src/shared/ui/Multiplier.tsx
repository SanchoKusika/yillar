import styles from "./Multiplier.module.css";

type MultiplierProps = { n?: number };

export function Multiplier({ n = 1 }: MultiplierProps) {
  return (
    <span
      className={styles.badge}
      style={{
        fontSize: 28,
        letterSpacing: "-0.02em",
        padding: "4px 14px 6px",
        boxShadow: "2px 2px 0 0 rgba(0,0,0,0.3)",
        height: 40,
      }}
    >
      ×{n}
    </span>
  );
}

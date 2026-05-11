import type { ReactNode } from "react";
import styles from "./FieldLabel.module.css";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className={styles.label}>{children}</span>;
}

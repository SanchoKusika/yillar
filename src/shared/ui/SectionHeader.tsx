import styles from "./SectionHeader.module.css";

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className={styles.root}>
      <span className={styles.text}>{title}</span>
      <div className={styles.line} />
    </div>
  );
}

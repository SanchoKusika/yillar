import { useT } from "@shared/lib";
import styles from "./ProfilePage.module.css";

type TopStatsProps = {
  bestScore: number | null | undefined;
  averageScore: number | null | undefined;
  gamesPlayed: number | null | undefined;
};

export function TopStats({ bestScore, averageScore, gamesPlayed }: TopStatsProps) {
  const t = useT();
  return (
    <div className="relative grid grid-cols-3 border-b border-gold">
      <StatCell label={t("profile.statBest")} value={bestScore} />
      <StatCell label={t("profile.statAvg")} value={averageScore} bordered />
      <StatCell label={t("profile.statPlayed")} value={gamesPlayed} bordered />
    </div>
  );
}

function StatCell({
  label,
  value,
  bordered,
}: {
  label: string;
  value: number | null | undefined;
  bordered?: boolean;
}) {
  return (
    <div className={`px-[10px] py-3 text-center ${bordered ? "border-l border-ink-3" : ""}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value == null ? "—" : value}</div>
    </div>
  );
}

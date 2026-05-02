import { GirihOverlay, PaperGrain } from "@shared/ui";
import { useT } from "@shared/lib";
import styles from "./SongCard.module.css";

type SongCardProps = {
  title: string;
  artist: string;
  cardIdx?: number;
  totalCards?: number;
};

export function SongCard({ title, artist, cardIdx, totalCards }: SongCardProps) {
  const t = useT();
  const caseNo =
    cardIdx != null && totalCards != null
      ? t("song.case", {
          n: `${String(cardIdx + 1).padStart(2, "0")}/${String(totalCards).padStart(2, "0")}`,
        })
      : t("song.caseEmpty");

  return (
    <div className="px-[14px] pt-[14px]">
      <div className={styles.card}>
        <GirihOverlay size={140} opacity={0.06} />
        <PaperGrain opacity={0.32} />

        <div className={styles.header}>
          <span>{t("song.dossier")}</span>
          <span className={styles.caseNo}>{caseNo}</span>
        </div>

        <h2 className={styles.title}>{title}</h2>
        <div className={styles.artist}>{artist}</div>

        <div className={styles.redactBar}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.redactBlock} />
          ))}
          <div className={styles.redactLabel}>{t("song.classified")}</div>
        </div>
      </div>
    </div>
  );
}

import { CatalogLine, EraSelect } from "@shared/ui";
import { useT, type Era } from "@shared/lib";
import type { Player } from "@entities/player";
import styles from "./PlayerRoster.module.css";

type PlayerRosterProps = {
  players: Player[];
  onName: (idx: number, name: string) => void;
  onEra: (idx: number, era: Era) => void;
  hostLockedAt?: number | null;
};

export function PlayerRoster({ players, onName, onEra, hostLockedAt = null }: PlayerRosterProps) {
  const t = useT();
  const activeCount = players.filter((p) => p.name).length;

  return (
    <div className="relative px-4 pt-[14px] pb-4">
      <CatalogLine
        left={t("roster.heading")}
        right={`${activeCount} / 4`}
        style={{ marginBottom: 10 }}
      />

      <ul>
      {players.map((p, i) => {
        const filled = p.name.length > 0;
        const isLocked = hostLockedAt === i;
        return (
          <li
            key={p.id}
            className={styles.playerRow}
            data-filled={filled}
            style={{ borderLeftColor: filled && p.era ? `var(--color-${p.era}-primary)` : undefined }}
          >
            <div className="mb-[10px] flex items-center gap-[10px]">
              <span className={styles.playerLabel}>
                {isLocked
                  ? t("roster.you")
                  : `${t("roster.playerPrefix")}${String(i + 1).padStart(2, "0")}`}
              </span>
              <input
                value={p.name}
                onChange={(e) => onName(i, e.target.value)}
                placeholder={i < 2 ? t("roster.enterName") : t("roster.optional")}
                maxLength={12}
                readOnly={isLocked}
                disabled={isLocked}
                title={isLocked ? t("roster.lockedTitle") : undefined}
                className={styles.nameInput}
                data-filled={filled}
                data-locked={isLocked || undefined}
                style={isLocked ? { cursor: "not-allowed" } : undefined}
              />
            </div>

            <EraSelect value={p.era ?? null} onChange={(era) => onEra(i, era)} />
          </li>
        );
      })}
      </ul>

      <div className={styles.hint}>{t("roster.hint")}</div>
    </div>
  );
}

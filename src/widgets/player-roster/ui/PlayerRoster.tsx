import { CatalogLine } from "@shared/ui";
import { ERAS, ERA_LABEL, useT, type Era } from "@shared/lib";
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

      {players.map((p, i) => {
        const filled = p.name.length > 0;
        const isLocked = hostLockedAt === i;
        return (
          <div
            key={p.id}
            className={styles.playerRow}
            data-filled={filled}
            style={{
              borderLeftColor: filled && p.era ? `var(--color-${p.era}-primary)` : undefined,
            }}
          >
            <div className="mb-[10px] flex items-center gap-[10px]">
              <span className="w-[26px] font-mono text-[10px] tracking-[0.2em] text-gold">
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

            <div className="grid grid-cols-3 gap-[6px]">
              {ERAS.map((e) => (
                <EraToggle key={e} era={e} active={p.era === e} onClick={() => onEra(i, e)} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-2 text-center text-[12px] italic leading-[1.45] text-cream opacity-55">
        {t("roster.hint")}
      </div>
    </div>
  );
}

function EraToggle({ era, active, onClick }: { era: Era; active: boolean; onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.eraToggle}
      data-era={era}
      data-active={active}
    >
      <div className="text-[9px] tracking-[0.12em] opacity-80">{ERA_LABEL[era]}</div>
      <div>{t(`era.${era}` as const)}</div>
    </button>
  );
}

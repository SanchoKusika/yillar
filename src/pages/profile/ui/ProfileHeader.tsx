import { EraTag } from "@shared/ui";
import { useT, type Era } from "@shared/lib";
import styles from "./ProfilePage.module.css";

type ProfileHeaderProps = {
  displayName: string;
  initial: string;
  era: Era | null;
  avatarUrl: string | null;
  email: string | null;
  isAnon: boolean;
};

export function ProfileHeader({ displayName, initial, era, avatarUrl, email, isAnon }: ProfileHeaderProps) {
  const t = useT();
  return (
    <header className="relative border-b border-ink-3 px-4 py-4">
      <div className="flex items-center gap-[14px]">
        <div className={styles.avatarWrap}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className={styles.avatarImg} />
          ) : (
            <div
              className={styles.avatarLetter}
              style={{
                background: era ? `var(--color-${era}-primary)` : "var(--color-gold)",
                color: era ? `var(--color-${era}-surface)` : "var(--color-ink)",
              }}
            >
              {initial}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className={styles.displayName}>{displayName}</div>
          <div className="mt-[6px]">
            {era ? (
              <EraTag era={era} boxed onDark />
            ) : (
              <span className={styles.noGeneration}>{t("profile.noGeneration")}</span>
            )}
          </div>
          <div className={styles.subtitle}>
            {isAnon ? t("profile.guestSubtitle") : email ?? t("profile.memberSubtitle")}
          </div>
        </div>
      </div>
    </header>
  );
}

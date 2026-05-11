import { CatalogLine } from "@shared/ui";
import { useT } from "@shared/lib";
import styles from "./FriendsTab.module.css";

export function FriendsTab() {
  const t = useT();
  return (
    <div>
      <CatalogLine
        left={t("profile.leaderboardWeek")}
        right={t("profile.zeroFriends")}
        style={{ marginBottom: 10 }}
      />

      <div className={styles.emptyCard}>
        <div className={styles.emptyTitle}>{t("profile.friends.emptyTitle")}</div>
        <div className={styles.emptySoon}>{t("profile.friends.emptySoon")}</div>
        <div className={styles.emptyBody}>{t("profile.friends.emptyBody")}</div>
      </div>

      <button type="button" disabled className={styles.inviteBtn}>
        {t("profile.friends.invite")}
      </button>
    </div>
  );
}

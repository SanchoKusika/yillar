import { useNavigate } from "react-router-dom";
import { GirihOverlay, PhoneFrame, Wordmark } from "@shared/ui";
import { useT, haptic } from "@shared/lib";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "./HomePage.module.css";

export function HomePage() {
  const navigate = useNavigate();
  const t = useT();

  const onPassPlay = () => {
    haptic("light");
    navigate("/lobby");
  };

  const onOnline = () => {
    haptic("light");
    navigate("/online");
  };

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col">
        <GirihOverlay size={220} opacity={0.04} />

        <header className={styles.pageHeader}>
          <div className="inline-block">
            <Wordmark color="var(--color-gold)" size={48} />
          </div>
        </header>

        <div className="h-px bg-gold/50" />

        <div className={styles.modes}>
          {/* PASS & PLAY */}
          <button
            type="button"
            className={styles.modeBlock}
            onClick={onPassPlay}
            aria-label={t("home.mode.passPlay")}
          >
            <GirihOverlay size={160} opacity={0.045} />
            <div className={styles.modeLabel}>{t("home.mode.passPlayLabel")}</div>
            <div className={styles.modeName}>{t("home.mode.passPlay")}</div>
            <div className={styles.modeSub}>{t("home.mode.passPlaySub")}</div>
            <span className={styles.modeArrow}>→</span>
          </button>

          <div className={styles.modeDivider} />

          {/* ONLINE */}
          <button
            type="button"
            className={`${styles.modeBlock} ${styles.modeOnline}`}
            onClick={onOnline}
            aria-label={t("home.mode.online")}
          >
            <GirihOverlay size={160} opacity={0.03} />
            <div className={styles.modeLabel}>{t("home.mode.onlineLabel")}</div>
            <div className={styles.modeName}>{t("home.mode.online")}</div>
            <div className={styles.modeSub}>{t("home.mode.onlineSub")}</div>
            <span className={styles.modeArrow}>→</span>
          </button>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

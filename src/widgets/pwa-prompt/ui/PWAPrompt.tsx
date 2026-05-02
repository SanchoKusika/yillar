import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useT } from "@shared/lib";
import styles from "./PWAPrompt.module.css";

const OFFLINE_TOAST_MS = 2400;

export function PWAPrompt() {
  const t = useT();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      console.warn("[YILLAR] SW register failed", err);
    },
  });

  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!offlineReady) return;
    setShowOffline(true);
    const timer = setTimeout(() => {
      setShowOffline(false);
      setOfflineReady(false);
    }, OFFLINE_TOAST_MS);
    return () => clearTimeout(timer);
  }, [offlineReady, setOfflineReady]);

  if (needRefresh) {
    return (
      <div className={styles.banner} role="alert">
        <span className={styles.dot} aria-hidden />
        <span className={styles.text}>{t("pwa.newVersion")}</span>
        <button className={styles.btn} onClick={() => updateServiceWorker(true)}>
          {t("pwa.update")}
        </button>
        <button
          className={styles.dismiss}
          onClick={() => setNeedRefresh(false)}
          aria-label={t("pwa.dismiss")}
        >
          ×
        </button>
      </div>
    );
  }

  if (showOffline) {
    return (
      <div className={styles.toast} role="status">
        <span className={styles.dot} aria-hidden />
        <span className={styles.text}>{t("pwa.offlineReady")}</span>
      </div>
    );
  }

  return null;
}

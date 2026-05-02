import { NavLink } from "react-router-dom";
import { useT } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import styles from "./BottomNav.module.css";

type Tab = { to: string; label: string; key: string };

export function BottomNav() {
  const t = useT();
  const isRegistered = useSessionStore((s) => s.user !== null && !s.user.isAnonymous);

  const tabs: Tab[] = [
    { to: "/", label: t("nav.home"), key: "home" },
    { to: "/profile", label: t("nav.profile"), key: "profile" },
    ...(isRegistered ? [] : [{ to: "/auth", label: t("nav.auth"), key: "auth" }]),
  ];

  return (
    <nav className={styles.nav} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
        >
          <span className={styles.label}>{tab.label}</span>
          <span className={styles.tick} aria-hidden />
        </NavLink>
      ))}
    </nav>
  );
}

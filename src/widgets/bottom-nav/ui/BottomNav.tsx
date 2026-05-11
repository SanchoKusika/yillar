import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import { IconHome, IconProfile, IconAuth } from "@shared/ui";
import { useSessionStore } from "@entities/session";
import styles from "./BottomNav.module.css";

type Tab = {
  to: string;
  key: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
};

export function BottomNav() {
  const isRegistered = useSessionStore((s) => s.user !== null && !s.user.isAnonymous);

  const tabs: Tab[] = [
    { to: "/", key: "home", icon: IconHome, label: "home" },
    { to: "/profile", key: "profile", icon: IconProfile, label: "profile" },
    ...(isRegistered ? [] : [{ to: "/auth", key: "auth", icon: IconAuth, label: "auth" }]),
  ];

  return (
    <nav className={styles.nav} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(({ to, key, icon: Icon }) => (
        <NavLink
          key={key}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
        >
          <Icon className={styles.icon} />
        </NavLink>
      ))}
    </nav>
  );
}

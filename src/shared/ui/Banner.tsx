import type { ReactNode } from "react";
import styles from "./Banner.module.css";

type BannerVariant = "error" | "gold";

export function Banner({ variant = "error", children }: { variant?: BannerVariant; children: ReactNode }) {
  return <div className={styles[variant]}>{children}</div>;
}

import type { ReactNode } from "react";
import styles from "./PhoneFrame.module.css";

type PhoneFrameProps = { children: ReactNode };

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className={styles.frame}>
      {children}
    </div>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Era } from "@shared/lib";
import { cn } from "@shared/lib";
import styles from "./YButton.module.css";

type Variant = "primary" | "ink" | "ghost" | "era";

type YButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  variant?: Variant;
  era?: Era;
};

export function YButton({
  children,
  variant = "primary",
  era,
  className,
  disabled,
  style,
  ...rest
}: YButtonProps) {
  const eraStyle =
    variant === "era" && era
      ? {
          ["--y-era-bg" as string]: `var(--color-${era}-primary)`,
          ["--y-era-fg" as string]: `var(--color-${era}-surface)`,
        }
      : undefined;

  return (
    <button
      {...rest}
      disabled={disabled}
      style={{ ...eraStyle, ...style }}
      className={cn(styles.btn, styles[variant], disabled && styles.disabled, className)}
    >
      {children}
    </button>
  );
}

import type { CSSProperties, ReactNode } from "react";

type CatalogLineProps = {
  left: ReactNode;
  right: ReactNode;
  color?: string;
  style?: CSSProperties;
  className?: string;
};

export function CatalogLine({ left, right, color = "var(--color-gold)", style, className }: CatalogLineProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

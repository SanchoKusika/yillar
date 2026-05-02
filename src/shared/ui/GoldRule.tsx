import type { CSSProperties } from "react";

type GoldRuleProps = { style?: CSSProperties; className?: string };

export function GoldRule({ style, className }: GoldRuleProps) {
  return <div className={className} style={{ height: 1, background: "var(--color-gold)", width: "100%", ...style }} />;
}
